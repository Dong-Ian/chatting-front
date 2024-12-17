import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { tokenState } from "../../Utils/Atom/Atom";

import styles from "../style/project.module.css";

import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import EditMemoComponent from "../component/EditMemoComponent";
import GetComponentListFunction from "../function/GetComponentListFunction";
import CreateComponentFunction from "../function/CreateComponentFunction";

const ProjectPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectSeq = searchParams.get("projectSeq");
  const token = useRecoilValue(tokenState);

  const [layout, setLayout] = useState<Layout[]>([]);
  const [counter, setCounter] = useState(0);
  const [editMode, setEditMode] = useState<string | null>(null);

  const addMemo = () => {
    console.log(counter);
    const maxY = layout.reduce(
      (max, item) => Math.max(max, item.y + item.h),
      0
    );

    const newItem: Layout = {
      i: `memo-${counter}`,
      x: 0,
      y: maxY,
      w: 3,
      h: 3,
      maxH: 10,
      maxW: 10,
      minH: 2,
      minW: 3,
      isResizable: true,
      isDraggable: true,
      isBounded: false,
      resizeHandles: ["se", "sw"],
    };

    setLayout([...layout, newItem]);
    setCounter(counter + 1);
  };

  const modify = ({ index }: { index: string }) => {
    const [type, idx] = index.split("-");
    setEditMode(idx);
  };

  async function GetComponentList() {
    if (projectSeq) {
      const result = await GetComponentListFunction({
        token: token,
        projectSeq: projectSeq,
      });

      if (result.result) {
        const layouts = result.result.map((item: any) => ({
          i: item.componentName,
          x: Number(item.componentX),
          y: Number(item.componentY),
          w: Number(item.componentWidth),
          h: Number(item.componentHeight),
          maxH: 10,
          maxW: 10,
          minH: 2,
          minW: 3,
          isResizable: true,
          isDraggable: true,
          isBounded: false,
          resizeHandles: ["se", "sw"],
        }));

        setLayout(layouts);
      }
    }
  }

  async function CreateComponent(item: Layout) {
    if (projectSeq) {
      const result = await CreateComponentFunction({
        token,
        item: {
          x: item.x.toString(),
          y: item.y.toString(),
          h: item.h.toString(),
          w: item.w.toString(),
          projectSeq: projectSeq,
          i: item.i,
          data: "hello",
          type: "memo",
        },
      });

      if (result.code === "COMPONENT0000") {
        GetComponentList();
      }
    }
  }

  const initializeCounter = (layouts: Layout[]) => {
    console.log(layouts);
    const maxCounter = layouts.reduce((max, item) => {
      const parts = item.i.split("-");
      const num = Number(parts[parts.length - 1]) || 0;
      return Math.max(max, num);
    }, 0);

    setCounter(maxCounter + 1);
  };

  useEffect(() => {
    GetComponentList();
  }, []);

  useEffect(() => {
    if (layout.length > 0) {
      initializeCounter(layout);
    }
  }, [layout]);

  return (
    <div className={styles.project_outer_container}>
      <button onClick={addMemo} style={{ marginBottom: "10px" }}>
        + Add Memo
      </button>

      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={1200}
        preventCollision={true}
        isDraggable={true}
        isResizable={true}
        margin={[30, 30]}
        containerPadding={[10, 10]}
        compactType={null}
        onLayoutChange={(newLayout) => setLayout(newLayout)}
      >
        {layout.map((item) => {
          const [type, index] = item.i.split("-");

          return (
            <div key={item.i} className={styles.component_box}>
              {editMode === index ? (
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    setEditMode(null);
                    CreateComponent(item);
                  }}
                >
                  완료
                </button>
              ) : (
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => modify({ index: item.i })}
                >
                  수정
                </button>
              )}
              {editMode === index ? (
                <div>
                  <EditMemoComponent />
                </div>
              ) : (
                <div>memo 내용</div>
              )}
            </div>
          );
        })}
      </GridLayout>
    </div>
  );
};

export default ProjectPage;
