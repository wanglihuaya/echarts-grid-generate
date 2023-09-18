import { useDebounce, useSize, useUpdateEffect } from "ahooks";
import { Form, InputNumber, Radio, Switch } from "antd";
import ReactECharts, { EChartsInstance } from "echarts-for-react";
import { GridComponentOption } from "echarts/components";
import {
  EChartsOption,
  SeriesOption,
  TitleOption,
  XAXisOption,
  YAXisOption,
} from "echarts/types/dist/shared";
import _ from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { Item, Menu, RightSlot, contextMenu } from "react-contexify";
import "react-contexify/ReactContexify.css";
import type { IGenerateGrid } from "../utils/generateGrid";
import generateOption from "../utils/generateGrid";
import type { areaType } from "./DragSelect";
import DragSelect from "./DragSelect";

type optionType = {
  title: TitleOption[];
  grid: GridComponentOption[];
  xAxis: XAXisOption[];
  yAxis: YAXisOption[];
  series: SeriesOption[];
};

type gridStyleType = {
  borderColor: string;
  backgroundColor: string;
};

type gridPxType = {
  left: number;
  width: number;
  top: number;
  height: number;
};

/**
 * 将百分比转换为数字
 * @param {string} percent 百分比
 * @return {number} 百分比转换后的数字
 * */
const percentToNumber = (percent: string) => {
  return Number(percent?.replace("%", ""));
};

/**
 * 判断一个点是否在一个矩形内
 * @param {number} x 点的x坐标
 * @param {number} y 点的y坐标
 * @param {number} left 矩形距离左边距的距离
 * @param {number} width 矩形的宽度
 * @param {number} top 矩形距离上边距的距离
 * @param {number} height 矩形的高度
 * @return {boolean} 点是否在矩形内
 * */
const isInRect = (
  x: number,
  y: number,
  left: number,
  width: number,
  top: number,
  height: number
) => {
  if (x >= left && x <= left + width && y >= top && y <= top + height) {
    return true;
  } else {
    return false;
  }
};

export default function Charts() {
  const dataLength = 20; // 数据长度
  const columns = 6; // 列数
  const rows = Math.ceil(dataLength / columns); // 行数
  const top = 4; // 整个图的上边距
  const bottom = 1; // 整个图的下边距
  const left = 1; // 整个图的左边距
  const right = 1; // 整个图的右边距
  const rowSpace = 5; // 行间距
  const columnSpace = 2; // 列间距

  const axisShow = true; // 是否显示坐标轴轴线
  const axisTickShow = true; // 是否显示坐标轴刻度
  const axisLabelShow = true; // 是否显示坐标轴刻度标签
  const axisLabelType = "none"; // 刻度标签显示类型，可选值：'all'、'simple'、'none'
  const splitLineShow = false; // 是否显示grid分割线
  const splitAreaShow = false; // 是否显示grid分割区域

  const defaultBorderColor = "#ffffff00"; // 默认边框颜色
  const selectBorderColor = "#1890ff"; // 选中边框颜色
  const defaultBackgroundColor = "#fff"; // 默认背景颜色
  const successBackgroundColor = "#9bff9a"; // 成功背景颜色
  const errorBackgroundColor = "#ffa4a6"; // 失败背景颜色
  const warningBackgroundColor = "#ffdf9e"; // 警告背景颜色

  const successKey = "1"; // 通过的键盘按键
  const errorKey = "2"; // 失败的键盘按键
  const warningKey = "3"; // 警告的键盘按键
  const deleteAllKey = "Escape"; // 删除全部的键盘按键
  const selectAllKey = "a"; // 全选的键盘按键 ctrl + a

  const initOptionParams: IGenerateGrid = {
    dataLength,
    // dataList,
    columns,
    rows,
    top,
    bottom,
    left,
    right,
    rowSpace,
    columnSpace,
    axisShow,
    axisTickShow,
    axisLabelShow,
    axisLabelType,
    splitLineShow,
    splitAreaShow,
  };

  const echartsRef = useRef<EChartsInstance>(null); // echarts 实例
  const ref = useRef<HTMLDivElement | null>(null); // echarts 容器的实例
  const size = useSize(ref); // echarts 容器的大小
  const selectRef = useRef<HTMLDivElement | null>(null); // 选择框 容器的实例
  const [form] = Form.useForm(); // 表单实例
  const [optionParams, setOptionParams] = useState(initOptionParams); // 配置 echarts option 的参数
  const [gridStyle, setGridStyle] = useState<gridStyleType[]>([]); // grid 的样式
  const [gridPx, setGridPx] = useState<gridPxType[]>([]); // grid 在 echarts 的具体像素位置信息
  const [currentSelectGridIndex, setCurrentSelectGridIndex] =
    useState<number>(); // 当前选中的grid的index
  const [lastSelectGird, setLastSelectGird] = useState<number>(); // 上一次选中的grid的index
  const [optionSection, setOptionSection] = useState<optionType>(
    generateOption(initOptionParams) // echarts option
  );
  const [currentSelectArea, setCurrentSelectArea] = useState<areaType>();
  const debouncedArea = useDebounce(currentSelectArea, { wait: 50 });

  /**
   * 获取echarts的长和宽 根据optionSection.grid的left、right、top、bottom的百分比计算出实际的left、right、top、bottom
   * @param {optionType} nowOption 当前的option
   * @return {gridPxType[]} grid的位置信息
   * */
  const getGridPositionFun = (nowOption: optionType) => {
    const echartsWidth = echartsRef?.current?.getEchartsInstance()?.getWidth();
    const echartsHeight = echartsRef?.current
      ?.getEchartsInstance()
      ?.getHeight();

    if (selectRef.current) {
      selectRef.current.style.width = echartsWidth + "px";
      selectRef.current.style.height = echartsHeight + "px";
    }

    const nowGridPx: any = [];
    nowOption.grid.forEach((item) => {
      const { left, width, top, height }: any = item;
      nowGridPx.push({
        left: (percentToNumber(left) / 100) * echartsWidth,
        width: (percentToNumber(width) / 100) * echartsWidth,
        top: (percentToNumber(top) / 100) * echartsHeight,
        height: (percentToNumber(height) / 100) * echartsHeight,
      });
    });
    setGridPx(nowGridPx);
  };

  /**
   * 监听按住键盘事件
   * @param event 传过来的单击事件
   * @param nowGridStyle 当前的格子的样式
   */
  const keyDownFun = (event: any, nowGridStyle: gridStyleType[]) => {
    const { ctrlKey, metaKey, shiftKey } = event;
    gridPx.forEach((item, index) => {
      if (
        isInRect(
          event.offsetX,
          event.offsetY,
          item.left,
          item.width,
          item.top,
          item.height
        )
      ) {
        setLastSelectGird(index);
        // 单击 只能选中一个
        if (!shiftKey && !metaKey && !ctrlKey) {
          // 重置 nowGridStyle
          nowGridStyle = nowGridStyle.map((item) => ({
            ...item,
            borderColor: defaultBorderColor,
          }));
          nowGridStyle[index].borderColor = selectBorderColor;
        }

        // 按住 command 或者 ctrl 单个多选
        if ((metaKey || ctrlKey) && !shiftKey) {
          nowGridStyle = nowGridStyle.map((item) => ({
            ...item,
          }));
          if (nowGridStyle[index].borderColor === selectBorderColor) {
            nowGridStyle[index].borderColor = defaultBorderColor;
          } else {
            nowGridStyle[index].borderColor = selectBorderColor;
          }
        }

        // shift lastSelectGird 到点击的格子之间的格子都选中，批量多选
        if (shiftKey && !metaKey && !ctrlKey) {
          nowGridStyle = nowGridStyle.map((item) => ({
            ...item,
          }));
          if (lastSelectGird === undefined) {
            nowGridStyle[index].borderColor = selectBorderColor;
          } else {
            const min = Math.min(lastSelectGird, index);
            const max = Math.max(lastSelectGird, index);
            for (let i = min; i <= max; i++) {
              nowGridStyle[i].borderColor = selectBorderColor;
            }
          }
        }
      }
      setGridStyle(nowGridStyle);
    });
  };

  /**
   *
   * 监听单击键盘事件
   * @param nowGridStyle 当前的格子样式
   */
  const keyUpFun = (nowGridStyle: gridStyleType[]) => {
    // 监听键盘事件 esc 清空选中格子  ctrl+a 全选 1键 成功 2键 失败 3键 警告
    document.onkeydown = (e) => {
      const { ctrlKey, metaKey } = e;
      // 如果按了esc键，清空选中的格子
      if (e.key === deleteAllKey) {
        nowGridStyle.forEach((item) => {
          item.borderColor = defaultBorderColor;
        });
        setGridStyle(nowGridStyle);
        setLastSelectGird(undefined);
      }
      // 如果按了ctrl+a，全选
      if (e.key === selectAllKey && (metaKey || ctrlKey)) {
        // 屏蔽浏览器默认行为
        e.preventDefault();
        nowGridStyle.forEach((item) => {
          item.borderColor = selectBorderColor;
        });
        setGridStyle(nowGridStyle);
      }
      // 如果按了1键
      if (e.key === successKey) {
        nowGridStyle.forEach((item) => {
          if (item.borderColor === selectBorderColor) {
            item.backgroundColor = successBackgroundColor;
          }
        });
        setGridStyle(nowGridStyle);
      }

      // 如果按了2键
      if (e.key === errorKey) {
        nowGridStyle.forEach((item) => {
          if (item.borderColor === selectBorderColor) {
            item.backgroundColor = errorBackgroundColor;
          }
        });
        setGridStyle(nowGridStyle);
      }

      // 如果按了3键
      if (e.key === warningKey) {
        nowGridStyle.forEach((item) => {
          if (item.borderColor === selectBorderColor) {
            item.backgroundColor = warningBackgroundColor;
          }
        });
        setGridStyle(nowGridStyle);
      }
    };
  };

  /**
   * 监听窗口大小变化，重新计算位置
   * */
  useEffect(() => {
    getGridPositionFun(optionSection);
    if (size) {
      echartsRef.current
        ?.getEchartsInstance()
        ?.resize({ width: size.width, height: size.height });
    }
  }, [size]);

  /**
   * 当 echarts 参数发生变化时 重新生成 option、gridStyle、gridPx
   * */
  useMemo(() => {
    // 初始化 option
    const newOptionSection = generateOption(optionParams);
    const nowGridStyle = new Array(optionParams.dataLength)
      .fill({
        borderColor: defaultBorderColor,
        backgroundColor: defaultBackgroundColor,
      })
      .map((item) => ({ ...item }));

    setGridStyle(nowGridStyle);
    setOptionSection(newOptionSection);
    // 当布局发生变化时 重新计算grid的位置
    getGridPositionFun(newOptionSection);
  }, [optionParams]);

  /**
   * 当 gridStyle 发生变化时 重新生成 option
   * */
  useMemo(() => {
    const nowOptionSection = _.cloneDeep(optionSection);
    gridStyle.forEach((item, index) => {
      nowOptionSection.grid[index].borderColor = item.borderColor;
      nowOptionSection.grid[index].backgroundColor = item.backgroundColor;
    });
    setOptionSection(nowOptionSection);
  }, [gridStyle]);

  /**
   * 当 gridPx 发生变化时 重新生成 gridStyle、gridPx
   * */
  useEffect(() => {
    // 当grid位置信息不为空时
    if (gridPx.length > 0) {
      const nowGridStyle: gridStyleType[] = _.cloneDeep(gridStyle);
      // 查看有几个选中的格子
      const isSelectNum = gridStyle.filter((item) => {
        return item.borderColor === selectBorderColor;
      }).length;

      // 监听 echarts 的 zrender 的 click 事件
      echartsRef?.current
        ?.getEchartsInstance()
        ?.getZr()
        .on("click", (e: any) => {
          const event = e.event;
          // 长按键盘事件
          keyDownFun(event, nowGridStyle);
        });

      // 监听 echarts 的 zrender 的 rightClick 事件
      echartsRef?.current
        ?.getEchartsInstance()
        ?.getZr()
        .on("contextmenu", (e: any) => {
          // 右击
          const event = e.event;
          event.preventDefault();

          if (isSelectNum <= 1) {
            // 长按键盘事件
            keyDownFun(event, nowGridStyle);
          }

          // 右击菜单
          const indexClick = gridPx.findIndex((item) => {
            return isInRect(
              event.offsetX,
              event.offsetY,
              item.left,
              item.width,
              item.top,
              item.height
            );
          });

          // 如果点击的格子存在
          if (indexClick !== -1) {
            console.log("indexClick", indexClick);

            setCurrentSelectGridIndex(indexClick);
          } else {
            console.log("123");
          }
        });

      // 监听单机键盘事件
      keyUpFun(nowGridStyle);
    }

    return () => {
      echartsRef?.current?.getEchartsInstance()?.getZr().off("click");
      echartsRef?.current?.getEchartsInstance()?.getZr().off("contextmenu");
      document.onkeydown = null;
    };
  }, [gridPx, gridStyle]);

  /**
   * 当 option 发生变化时,重新set echarts option
   * */
  useUpdateEffect(() => {
    echartsRef?.current?.getEchartsInstance()?.setOption(optionSection);
  }, [optionSection]);

  const isRectCross = (
    x1: number, // 选中区域的左上角x坐标
    y1: number, // 选中区域的左上角y坐标
    w1: number, // 选中区域的宽度
    h1: number, // 选中区域的高度
    x2: number, // grid的左上角x坐标
    y2: number, // grid的左上角y坐标
    w2: number, // grid的宽度
    h2: number // grid的高度
  ) => {
    if (
      (x1 >= x2 &&
        x1 <= x2 + w2 &&
        y1 >= y2 &&
        y1 <= y2 + h2 &&
        w1 > 0 &&
        h1 > 0) ||
      (x1 <= x2 &&
        x1 + w1 >= x2 &&
        y1 >= y2 &&
        y1 <= y2 + h2 &&
        w1 > 0 &&
        h1 > 0) ||
      (x1 >= x2 &&
        x1 <= x2 + w2 &&
        y1 <= y2 &&
        y1 + h1 >= y2 &&
        w1 > 0 &&
        h1 > 0) ||
      (x1 <= x2 &&
        x1 + w1 >= x2 &&
        y1 <= y2 &&
        y1 + h1 >= y2 &&
        w1 > 0 &&
        h1 > 0)
    ) {
      return true;
    }
  };

  useMemo(() => {
    if (currentSelectArea) {
      const { x, y, width: w, height: h } = currentSelectArea;
      const nowGridStyle = _.cloneDeep(gridStyle);
      // 选中currentSelectArea区域中 包含的grid
      gridPx.forEach((item, index) => {
        const { left, top, width, height } = item;
        // 如果item 和 currentSelectArea 有交集
        if (isRectCross(x, y, w, h, left, top, width, height)) {
          nowGridStyle[index].borderColor = selectBorderColor;
        }
      });
      setGridStyle(nowGridStyle);
    }
  }, [debouncedArea]);

  /**
   * **************
   * 生成 Option
   * **************
   */
  const option: EChartsOption = {
    backgroundColor: "#eee",
    title: optionSection.title,
    grid: optionSection.grid,
    tooltip: {
      formatter: "Group {a}: ({c})",
    },
    xAxis: optionSection.xAxis,
    yAxis: optionSection.yAxis,
    series: optionSection.series,
  };

  const items = [
    {
      label: "成功",
      key: "1",
      color: successBackgroundColor,
    },
    {
      label: "失败",
      key: "2",
      color: errorBackgroundColor,
    },
    {
      label: "警告",
      key: "3",
      color: warningBackgroundColor,
    },
  ];

  const onClickMenuItem = (color: string) => {
    const nowGridStyle = _.cloneDeep(gridStyle);
    const isSelectNum = gridStyle.filter((item) => {
      return item.borderColor === selectBorderColor;
    }).length;
    // 如果选中的格子大于1个 则批量修改
    if (isSelectNum > 1) {
      nowGridStyle.forEach((item) => {
        if (item.borderColor === selectBorderColor) {
          item.backgroundColor = color;
        }
      });
      setGridStyle(nowGridStyle);
    } else {
      console.log("currentSelectGridIndex", currentSelectGridIndex);
      // 如果选中的格子只有一个 则修改当前选中的格子
      if (!_.isNil(currentSelectGridIndex)) {
        nowGridStyle[currentSelectGridIndex].backgroundColor = color;
        setGridStyle(nowGridStyle);
      }
    }
  };

  return (
    <div>
      <Form
        layout="inline"
        form={form}
        initialValues={initOptionParams}
        onValuesChange={(e) => {
          const values = form.getFieldsValue(true);
          const key = Object.keys(e)[0];
          const value = Object.values(e)[0];
          values[key] = value;
          setOptionParams(values);
        }}
      >
        <Form.Item label="数据长度" name="dataLength">
          <InputNumber />
        </Form.Item>
        <Form.Item label="列数" name="columns">
          <InputNumber />
        </Form.Item>
        <Form.Item label="整个图的上边距" name="top">
          <InputNumber />
        </Form.Item>
        <Form.Item label="整个图的下边距" name="bottom">
          <InputNumber />
        </Form.Item>
        <Form.Item label="整个图的左边距" name="left">
          <InputNumber />
        </Form.Item>
        <Form.Item label="整个图的右边距" name="right">
          <InputNumber />
        </Form.Item>
        <Form.Item label="行间距" name="rowSpace">
          <InputNumber />
        </Form.Item>
        <Form.Item label="列间距" name="columnSpace">
          <InputNumber />
        </Form.Item>
        <Form.Item name="axisShow" label="坐标轴">
          <Switch />
        </Form.Item>
        <Form.Item name="axisTickShow" label="坐标轴刻度">
          <Switch />
        </Form.Item>
        <Form.Item label="标签显示类似" name="axisLabelType">
          <Radio.Group>
            <Radio.Button value="all">all</Radio.Button>
            <Radio.Button value="simple">simple</Radio.Button>
            <Radio.Button value="none">none</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="splitLineShow" label="grid 分割线">
          <Switch />
        </Form.Item>
        <Form.Item name="splitAreaShow" label="grid 分割区域">
          <Switch />
        </Form.Item>
      </Form>

      <div
        style={{
          position: "relative",
        }}
        onContextMenu={(e: React.MouseEvent) => {
          gridPx.forEach((item) => {
            if (
              isInRect(
                e.nativeEvent.offsetX,
                e.nativeEvent.offsetY,
                item.left,
                item.width,
                item.top,
                item.height
              )
            ) {
              contextMenu.show({
                id: "menubar",
                event: e,
              });
            }
          });
        }}
        ref={ref}
      >
        <DragSelect
          getArea={setCurrentSelectArea}
          offset={{
            left: ref?.current?.offsetLeft || 0,
            top: ref?.current?.offsetTop || 0,
          }}
          ref={selectRef}
        >
          <ReactECharts
            className="Charts"
            style={{
              height: "600px",
              width: "100%",
            }}
            ref={echartsRef}
            option={option}
          />
        </DragSelect>
      </div>
      <Menu id="menubar" animation={false}>
        {items.map((item) => (
          <Item
            key={item.key}
            onClick={() => {
              onClickMenuItem(item.color);
            }}
          >
            {item.label}
            <RightSlot>{item.key}</RightSlot>
          </Item>
        ))}
      </Menu>
    </div>
  );
}
