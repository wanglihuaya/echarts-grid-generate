import { forwardRef, useState } from "react";

interface posType {
  x?: number;
  y?: number;
}
export type areaType = {
  x: number;
  y: number;
  width: number;
  height: number;
};
type dragSelectProps = {
  children: React.ReactNode;
  getArea: (area: areaType) => void;
  offset: { left: number; top: number };
  width?: number;
  height?: number;
};

type eventType = {
  button: number;
  clientX: number;
  clientY: number;
};

const DragSelect = forwardRef<HTMLDivElement, dragSelectProps>((props, ref) => {
  const [startPos, setStartPos] = useState<posType>();
  const [currentSelectArea, setCurrentSelectArea] = useState<areaType>();
  const { children, getArea, offset } = props;

  const onMouseDown = (e: eventType) => {
    // 屏蔽右击事件
    if (e.button !== 2) {
      setStartPos({
        x: e.clientX - offset.left,
        y: e.clientY - offset.top,
      });
    }
  };

  const onMouseMove = (e: eventType) => {
    // 屏蔽右击事件
    if (e.button !== 2) {
      if (startPos) {
        // 绘制选区
        const x1 = startPos.x as number;
        const y1 = startPos.y as number;
        const x2 = e.clientX - offset.left;
        const y2 = e.clientY - offset.top;

        const nowSelectArea = {
          x: Math.min(x1, x2),
          y: Math.min(y1, y2),
          width: Math.abs(x1 - x2),
          height: Math.abs(y1 - y2),
        };

        getArea(nowSelectArea);
        setCurrentSelectArea(nowSelectArea);
      } else {
        return;
      }
    } else {
      return;
    }
  };
  const onMouseLeave = () => {
    setStartPos(undefined);
    setCurrentSelectArea(undefined);
  };

  const onMouseUp = () => {
    setStartPos(undefined);
    setCurrentSelectArea(undefined);
  };

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      {/* 绘制拖动选择组件 */}
      {currentSelectArea && (
        <div
          style={{
            position: "absolute",
            zIndex: 66,
            left: currentSelectArea.x,
            top: currentSelectArea.y,
            width: currentSelectArea.width,
            height: currentSelectArea.height,
            border: "1px dashed rgb(84, 84, 255)",
            backgroundColor: "rgba(84, 84, 255, 0.2)",
          }}
        />
      )}
      {children}
    </div>
  );
});

export default DragSelect;
