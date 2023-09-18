import { GridComponentOption } from "echarts/components";
import {
  SeriesOption,
  TitleOption,
  XAXisOption,
  YAXisOption,
} from "echarts/types/dist/shared";

export type IGenerateGrid = {
  dataLength: number;
  // dataList: number[][];
  columns: number;
  rows: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
  rowSpace: number;
  columnSpace: number;
  axisShow: boolean;
  axisTickShow: boolean;
  axisLabelType: "all" | "simple" | "none";
  axisLabelShow: boolean;
  splitLineShow: boolean;
  splitAreaShow: boolean;
};

export type optionSectionType = (props: IGenerateGrid) => {
  title: TitleOption[];
  grid: GridComponentOption[];
  xAxis: XAXisOption[];
  yAxis: YAXisOption[];
  series: SeriesOption[];
};

// 数组合并去重
const mergedArray = (array1: any[], array2: any[]) => {
  return Array.from(new Set([...array1, ...array2]));
};

// 生成网格option
const generateOption: optionSectionType = (props: IGenerateGrid) => {
  const newProps = props;
  newProps.rows = Math.ceil(newProps.dataLength / newProps.columns);
  const {
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
  } = newProps;

  // 随机数据
  const dataList = Array.from({ length: dataLength }, () =>
    Array.from({ length: dataLength }, () => Math.floor(Math.random() * 20))
  );

  // X坐标轴标签的显示类型
  const xAxisLabelTypeFun = (index: number) => {
    let show = true;

    switch (axisLabelType) {
      case "all":
        show = true;
        break;
      case "simple":
        show = mergedArray(
          Array.from(
            { length: columns },
            (_, idx) => dataLength - columns + idx
          ),
          Array.from(
            { length: dataLength % columns },
            (_, idx) => dataLength - (dataLength % columns) - columns + idx
          )
        ).includes(index)
          ? true
          : false;
        break;
      case "none":
        show = false;
        break;
      default:
        break;
    }

    return show;
  };

  // Y坐标轴标签的显示类型
  const yAxisLabelTypeFun = (index: number) => {
    let show = true;
    switch (axisLabelType) {
      case "all":
        show = true;
        break;
      case "simple":
        show = index % columns === 0 ? axisLabelShow : false;
        break;
      case "none":
        show = false;
        break;
      default:
        break;
    }

    return show;
  };

  // 每个 title 的上边距
  const titleTop = -3;

  // 每个 title 的左边距
  const titleLeftLabelTypeFun = (index: number) => {
    let titleLeft = 0;
    switch (axisLabelType) {
      case "all":
        titleLeft = 1.5;
        break;
      case "simple":
        titleLeft = index % columns !== 0 ? 0 : 1.5;
        break;
      case "none":
        titleLeft = 0;
        break;
      default:
        break;
    }
    return titleLeft;
  };

  /**
   * **************
   * 生成title
   * **************
   */
  const title: TitleOption[] = [];
  for (let i = 0; i < rows; i++) {
    const rowTitle = [];
    for (let j = 0; j < columns; j++) {
      if (i === 0) {
        if (j === 0) {
          // 第一行第一列
          rowTitle.push({
            text: `${i}-${j}`,
            left: `${
              ((100 - left - right - (columns - 1) * columnSpace) / columns +
                columnSpace) *
                j +
              left +
              titleLeftLabelTypeFun(j)
            }%`,
            top: `${
              ((110 - top - bottom - (rows - 1) * rowSpace) / rows + rowSpace) *
                i +
              top +
              titleTop
            }%`,
            padding: 0,
          });
          continue;
        } else if (j === columns - 1) {
          // 第一行最后一列
          rowTitle.push({
            text: `${i}-${j}`,
            left: `${
              ((100 - left - right - (columns - 1) * columnSpace) / columns +
                columnSpace) *
                j +
              left +
              titleLeftLabelTypeFun(j)
            }%`,
            top: `${
              ((100 - top - bottom - (rows - 1) * rowSpace) / rows + rowSpace) *
                i +
              top +
              titleTop
            }%`,
            padding: 0,
          });
          continue;
        } else {
          // 第一行中间列
          rowTitle.push({
            text: `${i}-${j}`,
            left: `${
              ((100 - left - right - (columns - 1) * columnSpace) / columns +
                columnSpace) *
                j +
              left +
              titleLeftLabelTypeFun(j)
            }%`,
            top: `${
              ((100 - top - bottom - (rows - 1) * rowSpace) / rows + rowSpace) *
                i +
              top +
              titleTop
            }%`,
            padding: 0,
          });
          continue;
        }
      } else if (i === rows - 1) {
        if (j === 0) {
          // 最后一行第一列
          rowTitle.push({
            text: `${i}-${j}`,
            left: `${
              ((100 - left - right - (columns - 1) * columnSpace) / columns +
                columnSpace) *
                j +
              left +
              titleLeftLabelTypeFun(j)
            }%`,
            top: `${
              ((100 - top - bottom - (rows - 1) * rowSpace) / rows + rowSpace) *
                i +
              top +
              titleTop
            }%`,
            padding: 0,
          });
          continue;
        } else if (j === columns - 1) {
          // 最后一行最后一列
          rowTitle.push({
            text: `${i}-${j}`,
            left: `${
              ((100 - left - right - (columns - 1) * columnSpace) / columns +
                columnSpace) *
                j +
              left +
              titleLeftLabelTypeFun(j)
            }%`,
            top: `${
              ((100 - top - bottom - (rows - 1) * rowSpace) / rows + rowSpace) *
                i +
              top +
              titleTop
            }%`,
            padding: 0,
          });
          continue;
        } else {
          // 最后一行中间列
          rowTitle.push({
            text: `${i}-${j}`,
            left: `${
              ((100 - left - right - (columns - 1) * columnSpace) / columns +
                columnSpace) *
                j +
              left +
              titleLeftLabelTypeFun(j)
            }%`,
            top: `${
              ((100 - top - bottom - (rows - 1) * rowSpace) / rows + rowSpace) *
                i +
              top +
              titleTop
            }%`,
            padding: 0,
          });
          continue;
        }
      } else {
        if (j === 0) {
          // 中间行第一列
          rowTitle.push({
            text: `${i}-${j}`,
            left: `${
              ((100 - left - right - (columns - 1) * columnSpace) / columns +
                columnSpace) *
                j +
              left +
              titleLeftLabelTypeFun(j)
            }%`,
            top: `${
              ((100 - top - bottom - (rows - 1) * rowSpace) / rows + rowSpace) *
                i +
              top +
              titleTop
            }%`,
            padding: 0,
          });
          continue;
        } else if (j === columns - 1) {
          // 中间行最后一列
          rowTitle.push({
            text: `${i}-${j}`,
            left: `${
              ((100 - left - right - (columns - 1) * columnSpace) / columns +
                columnSpace) *
                j +
              left +
              titleLeftLabelTypeFun(j)
            }%`,
            top: `${
              ((100 - top - bottom - (rows - 1) * rowSpace) / rows + rowSpace) *
                i +
              top +
              titleTop
            }%`,
            padding: 0,
          });
          continue;
        } else {
          // 中间行中间列
          rowTitle.push({
            text: `${i}-${j}`,
            left: `${
              ((100 - left - right - (columns - 1) * columnSpace) / columns +
                columnSpace) *
                j +
              left +
              titleLeftLabelTypeFun(j)
            }%`,
            top: `${
              ((100 - top - bottom - (rows - 1) * rowSpace) / rows + rowSpace) *
                i +
              top +
              titleTop
            }%`,
            padding: 0,
          });
          continue;
        }
      }
    }
    title.push(...rowTitle);
  }
  // 判断 title length 和 data length 是否相等
  if (title.length !== dataLength) {
    // 将 title 多余的部分删除
    title.splice(dataLength);
  }

  /**
   * **************
   * 生成grid
   * **************
   */
  const grid: GridComponentOption[] = [];
  for (let i = 0; i < rows; i++) {
    const rowGrid = [];
    for (let j = 0; j < columns; j++) {
      if (i === 0) {
        if (j === 0) {
          // 第一行第一列
          rowGrid.push({
            left: `${
              ((100 - left - right - (columns - 1) * columnSpace) / columns +
                columnSpace) *
                j +
              left
            }%`,
            width: `${
              (100 - right - left - (columns - 1) * columnSpace) / columns
            }%`,
            top: `${
              ((100 - top - bottom - (rows - 1) * rowSpace) / rows + rowSpace) *
                i +
              top
            }%`,
            height: `${(100 - top - bottom - (rows - 1) * rowSpace) / rows}%`,
            containLabel: true,
            show: true,
            backgroundColor: "#fff",
            borderColor: "#fff",
            borderWidth: 4,
          });
          continue;
        } else if (j === columns - 1) {
          // 第一行最后一列
          rowGrid.push({
            left: `${
              ((100 - left - right - (columns - 1) * columnSpace) / columns +
                columnSpace) *
                j +
              left
            }%`,
            width: `${
              (100 - right - left - (columns - 1) * columnSpace) / columns
            }%`,
            top: `${
              ((100 - top - bottom - (rows - 1) * rowSpace) / rows + rowSpace) *
                i +
              top
            }%`,
            height: `${(100 - top - bottom - (rows - 1) * rowSpace) / rows}%`,
            containLabel: true,
            show: true,
            backgroundColor: "#fff",
            borderColor: "#fff",
            borderWidth: 4,
          });
          continue;
        } else {
          // 第一行中间列
          rowGrid.push({
            left: `${
              ((100 - left - right - (columns - 1) * columnSpace) / columns +
                columnSpace) *
                j +
              left
            }%`,
            width: `${
              (100 - right - left - (columns - 1) * columnSpace) / columns
            }%`,
            top: `${
              ((100 - top - bottom - (rows - 1) * rowSpace) / rows + rowSpace) *
                i +
              top
            }%`,
            height: `${(100 - top - bottom - (rows - 1) * rowSpace) / rows}%`,
            containLabel: true,
            show: true,
            backgroundColor: "#fff",
            borderColor: "#fff",
            borderWidth: 4,
          });
          continue;
        }
      } else if (i === rows - 1) {
        if (j === 0) {
          // 最后一行第一列
          rowGrid.push({
            left: `${
              ((100 - left - right - (columns - 1) * columnSpace) / columns +
                columnSpace) *
                j +
              left
            }%`,
            width: `${
              (100 - right - left - (columns - 1) * columnSpace) / columns
            }%`,
            top: `${
              ((100 - top - bottom - (rows - 1) * rowSpace) / rows + rowSpace) *
                i +
              top
            }%`,
            height: `${(100 - top - bottom - (rows - 1) * rowSpace) / rows}%`,
            containLabel: true,
            show: true,
            backgroundColor: "#fff",
            borderColor: "#fff",
            borderWidth: 4,
          });
          continue;
        } else if (j === columns - 1) {
          // 最后一行最后一列
          rowGrid.push({
            left: `${
              ((100 - left - right - (columns - 1) * columnSpace) / columns +
                columnSpace) *
                j +
              left
            }%`,
            width: `${
              (100 - right - left - (columns - 1) * columnSpace) / columns
            }%`,
            top: `${
              ((100 - top - bottom - (rows - 1) * rowSpace) / rows + rowSpace) *
                i +
              top
            }%`,
            height: `${(100 - top - bottom - (rows - 1) * rowSpace) / rows}%`,
            containLabel: true,
            show: true,
            backgroundColor: "#fff",
            borderColor: "#fff",
            borderWidth: 4,
          });
          continue;
        } else {
          // 最后一行中间列
          rowGrid.push({
            left: `${
              ((100 - left - right - (columns - 1) * columnSpace) / columns +
                columnSpace) *
                j +
              left
            }%`,
            width: `${
              (100 - right - left - (columns - 1) * columnSpace) / columns
            }%`,
            top: `${
              ((100 - top - bottom - (rows - 1) * rowSpace) / rows + rowSpace) *
                i +
              top
            }%`,
            height: `${(100 - top - bottom - (rows - 1) * rowSpace) / rows}%`,
            containLabel: true,
            show: true,
            backgroundColor: "#fff",
            borderColor: "#fff",
            borderWidth: 4,
          });
          continue;
        }
      } else {
        if (j === 0) {
          // 中间行第一列
          rowGrid.push({
            left: `${
              ((100 - left - right - (columns - 1) * columnSpace) / columns +
                columnSpace) *
                j +
              left
            }%`,
            width: `${
              (100 - right - left - (columns - 1) * columnSpace) / columns
            }%`,
            top: `${
              ((100 - top - bottom - (rows - 1) * rowSpace) / rows + rowSpace) *
                i +
              top
            }%`,
            height: `${(100 - top - bottom - (rows - 1) * rowSpace) / rows}%`,
            containLabel: true,
            show: true,
            backgroundColor: "#fff",
            borderColor: "#fff",
            borderWidth: 4,
          });
          continue;
        } else if (j === columns - 1) {
          // 中间行最后一列
          rowGrid.push({
            left: `${
              ((100 - left - right - (columns - 1) * columnSpace) / columns +
                columnSpace) *
                j +
              left
            }%`,
            width: `${
              (100 - right - left - (columns - 1) * columnSpace) / columns
            }%`,
            top: `${
              ((100 - top - bottom - (rows - 1) * rowSpace) / rows + rowSpace) *
                i +
              top
            }%`,
            height: `${(100 - top - bottom - (rows - 1) * rowSpace) / rows}%`,
            containLabel: true,
            show: true,
            backgroundColor: "#fff",
            borderColor: "#fff",
            borderWidth: 4,
          });
          continue;
        } else {
          // 中间行中间列
          rowGrid.push({
            left: `${
              ((100 - left - right - (columns - 1) * columnSpace) / columns +
                columnSpace) *
                j +
              left
            }%`,
            width: `${
              (100 - right - left - (columns - 1) * columnSpace) / columns
            }%`,
            top: `${
              ((100 - top - bottom - (rows - 1) * rowSpace) / rows + rowSpace) *
                i +
              top
            }%`,
            height: `${(100 - top - bottom - (rows - 1) * rowSpace) / rows}%`,
            containLabel: true,
            show: true,
            backgroundColor: "#fff",
            borderColor: "#fff",
            borderWidth: 4,
          });
          continue;
        }
      }
    }
    grid.push(...rowGrid);
  }

  // 判断 grid length 和 data length 是否相等
  if (grid.length !== dataLength) {
    // 将 grid 多余的部分删除
    grid.splice(dataLength);
  }

  /**
   * **************
   * 生成 X 轴
   * **************
   */
  const xAxis: XAXisOption[] = Array.from({ length: dataLength }, (_, i) => ({
    gridIndex: i,
    min: 0,
    max: 20,
    show: axisShow,
    axisTick: {
      show: axisTickShow,
    },
    axisLabel: {
      show: xAxisLabelTypeFun(i),
      color:
        // xAxisLabelColorFun(i),
        Array.from(
          { length: columns },
          (_, idx) => dataLength - columns + idx
        ).includes(i)
          ? ""
          : "#ffffff00",
    },
    splitLine: {
      show: splitLineShow,
    },
    splitArea: {
      show: splitAreaShow,
    },
  }));

  /**
   * **************
   * 生成 Y 轴
   * **************
   */
  const yAxis: YAXisOption[] = Array.from({ length: dataLength }, (_, i) => ({
    gridIndex: i,
    min: 0,
    max: 20,
    show: axisShow,
    axisTick: {
      show: axisTickShow,
    },
    axisLabel: {
      show: yAxisLabelTypeFun(i),
    },
    splitLine: {
      show: splitLineShow,
    },
    splitArea: {
      show: splitAreaShow,
    },
  }));

  /**
   * **************
   * 生成 Series
   * **************
   */
  const series: SeriesOption[] = Array.from({ length: dataLength }, (_, i) => ({
    name: `I${i}`,
    id: `I${i}`,
    type: "scatter",
    xAxisIndex: i,
    yAxisIndex: i,
    data: dataList[i],
  }));

  return {
    title,
    grid,
    xAxis,
    yAxis,
    series,
  };
};

export default generateOption;
