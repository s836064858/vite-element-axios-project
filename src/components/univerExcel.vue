<template>
  <el-button type="primary" size="default" @click="setData">设置数据</el-button>

  <div id="univer-app" style="height: 100vh"></div>
</template>
<script setup>
const {
  UniverCore,
  UniverDesign,
  UniverEngineRender,
  UniverEngineFormula,
  UniverDocs,
  UniverDocsUi,
  UniverUi,
  UniverSheets,
  UniverSheetsUi,
  UniverSheetsNumfmt,
  UniverSheetsFormula,
  UniverFacade,
} = window
var univer = new UniverCore.Univer({
  theme: UniverDesign.defaultTheme,
  locale: UniverCore.LocaleType.ZH_CN,
  locales: {
    [UniverCore.LocaleType.ZH_CN]: UniverUMD['zh-CN'],
  },
})
univer.registerPlugin(UniverEngineRender.UniverRenderEnginePlugin)
univer.registerPlugin(UniverEngineFormula.UniverFormulaEnginePlugin)
univer.registerPlugin(UniverUi.UniverUIPlugin, {
  container: 'univer-app',
})
univer.registerPlugin(UniverDocs.UniverDocsPlugin, {
  hasScroll: false,
})
univer.registerPlugin(UniverDocsUi.UniverDocsUIPlugin)
univer.registerPlugin(UniverSheets.UniverSheetsPlugin)
univer.registerPlugin(UniverSheetsUi.UniverSheetsUIPlugin)
univer.registerPlugin(UniverSheetsNumfmt.UniverSheetsNumfmtPlugin)
univer.registerPlugin(UniverSheetsFormula.UniverSheetsFormulaPlugin)
univer.createUnit(UniverCore.UniverInstanceType.UNIVER_SHEET, {
  id: 'gyI0JO',
  sheetOrder: ['RSfWjJFv4opmE1JaiRj80'],
  name: '',
  appVersion: '0.1.11',
  locale: 'zhCN',
  styles: {
    header_style: {
      fs: 12,
      ht: 2,
      vt: 2,
      bg: {
        rgb: '#909399',
      },
      bd: {
        // 上边框
        t: {
          s: 1, // 边框样式
          cl: {
            // 边框颜色
            rgb: '#00000',
          },
        },
        // 下边框
        b: {
          s: 1, // 边框样式
          cl: {
            // 边框颜色
            rgb: '#00000',
          },
        },
        // 左边框
        l: {
          s: 1, // 边框样式
          cl: {
            // 边框颜色
            rgb: '#00000',
          },
        },
        // 右边框
        r: {
          s: 1, // 边框样式
          cl: {
            // 边框颜色
            rgb: '#00000',
          },
        },
      },
    },
  },
  sheets: {
    RSfWjJFv4opmE1JaiRj80: {
      id: 'RSfWjJFv4opmE1JaiRj80',
      name: '测试',
      tabColor: '',
      hidden: 0,
      rowCount: 65,
      columnCount: 16,
      zoomRatio: 1,
      freeze: {
        startRow: -1,
        startColumn: -1,
        ySplit: 0,
        xSplit: 0,
      },
      scrollTop: 0,
      scrollLeft: 0,
      defaultColumnWidth: 73,
      defaultRowHeight: 23,
      mergeData: [
        { startRow: 0, startColumn: 0, endRow: 1, endColumn: 0 },
        { startRow: 0, startColumn: 1, endRow: 1, endColumn: 1 },
        { startRow: 0, startColumn: 2, endRow: 1, endColumn: 2 },
        { startRow: 0, startColumn: 3, endRow: 1, endColumn: 3 },
        { startRow: 0, startColumn: 4, endRow: 0, endColumn: 16 },
      ],
      cellData: {
        0: {
          0: { v: '部门', s: 'header_style' },
          1: { v: '科目', s: 'header_style' },
          2: { v: '事项', s: 'header_style' },
          3: { v: '内容', s: 'header_style' },
          4: { v: '2024年6月', s: 'header_style' },
          5: { v: '', s: 'header_style' },
          6: { v: '', s: 'header_style' },
          7: { v: '', s: 'header_style' },
          8: { v: '', s: 'header_style' },
          9: { v: '', s: 'header_style' },
          10: { v: '', s: 'header_style' },
          11: { v: '', s: 'header_style' },
          12: { v: '', s: 'header_style' },
          13: { v: '', s: 'header_style' },
          14: { v: '', s: 'header_style' },
          15: { v: '', s: 'header_style' },
        },
        1: {
          0: { v: '', s: 'header_style' },
          1: { v: '', s: 'header_style' },
          2: { v: '', s: 'header_style' },
          3: { v: '', s: 'header_style' },
          4: { v: '目标', s: 'header_style' },
          5: { v: '目标IYA', s: 'header_style' },
          6: { v: '目标费比', s: 'header_style' },
          7: { v: '实际', s: 'header_style' },
          8: { v: '实际完成率', s: 'header_style' },
          9: { v: '实际费比', s: 'header_style' },
          10: { v: '预估', s: 'header_style' },
          11: { v: '预估完成率', s: 'header_style' },
          12: { v: '预估费比', s: 'header_style' },
          13: { v: '同期', s: 'header_style' },
          14: { v: '实际IYA', s: 'header_style' },
          15: { v: '同期费比', s: 'header_style' },
        },
      },
      rowData: {},
      columnData: {
        0: {
          w: 125,
          hd: 0,
        },
      },
      showGridlines: 1,
      rowHeader: {
        width: 46,
        hidden: 0,
      },
      columnHeader: {
        height: 20,
        hidden: 0,
      },
      selections: ['A1'],
      rightToLeft: 0,
    },
  },
  resources: [
    {
      name: 'SHEET_DEFINED_NAME_PLUGIN',
      data: '',
    },
  ],
})
const univerAPI = UniverFacade.FUniver.newAPI(univer)

function setData() {
  const activeSheet = univerAPI.getActiveWorkbook().getActiveSheet()
  let data = [
    ['事业六部', 'GMV', '', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '平台费用', '平台佣金', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售成本', '产品成本', '采购折扣', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '平台费用', '平台费用小计', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', 'GMV', '单量', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '前台销售毛利', '', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '营销推广费用合计', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '前台销售毛利', '前台销售毛利', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售成本', '商品成本合计', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', 'GMV', '客单价', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', 'GMV', '', '退后数量*RSP', '0', '0.00%', '0.00%', '0', '0.00%', '0.00%', '0', '0.00%', '0.00%', '0', '0.00%', '0.00%'],
    ['事业六部', '营销推广费用', '平台费用', '其他费用', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', 'GMV', '退后GMV合计', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售成本', '进货货补', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售成本', '进货返利', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '推广费用', '资源费用', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售成本', '商品损耗', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售成本', '进货返利', '合同内月返', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '补贴后销售毛利', '', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '推广费用', '会员费用', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '推广费用', '淘客佣金', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '种草费用', '内容费用', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', 'GMV', '合同目标GMV', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售成本', '产品成本', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售成本', '进货返利', '其他返利', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '平台费用', '保险费用', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', 'GMV', '', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售收入', '', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售收入', '销售收入', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '推广费用', '直播佣金', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '推广费用', '店播费用', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售收入', '销售净收入合计', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '种草费用', '达人费用', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '推广费用', '站内推广', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '种草费用', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', 'GMV', '合同目标GMV', '合同目标GMV', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售成本', '进货返利', '合同内年返', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售成本', '进货返利', '合同内季返', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '平台费用', '信用手续费', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', 'GMV', '退后GMV合计', 'TOC的退后GMV', '￥0.0', '0.00%', '', '￥0.0', '0.00%', '', '￥0.0', '0.00%', '', '￥0.0', '0.00%', ''],
    ['事业六部', '营销推广费用', '推广费用', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '推广费用', '推广费用小计', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售成本', '产品成本', '产品成本', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '种草费用', '投流费用', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', 'GMV', '销售折扣', '', '0', '0.00%', '0.00%', '0', '0.00%', '0.00%', '0', '0.00%', '0.00%', '0', '0.00%', '0.00%'],
    ['事业六部', '销售成本', '', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '推广费用', '直播坑位费', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '补贴后销售毛利', '补贴后销售毛利', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '前台销售毛利', '前台销售毛利率', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '种草费用', '种草费用合计', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售收入', '销售收入', '销售回款', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', 'ISV费用', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '平台费用', '平台返点', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '平台费用', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '平台费用', '软件费用', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售成本', '赠品成本', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售收入', '平台毛保', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '营销推广费用', '设计费用', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售成本', '进货返利', '返利合计', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '补贴后销售毛利', '补贴后销售毛利率', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售成本', '商品损耗', '销退未赔付、盘盈亏、报废等', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
    ['事业六部', '销售成本', '进货货补', '（合同外）亏损补贴', '', '0.00%', '', '', '0.00%', '', '', '0.00%', '', '', '0.00%', ''],
  ]
  console.log(data)
  const range1 = activeSheet.getRange(2, 0, data.length, data[0].length)
  range1.setValues(data)
}

let currentEditRange = {
  startColumn: null,
  startRow: null,
  endColumn: null,
  endRow: null,
}

univerAPI.onCommandExecuted((command) => {
  if (command.id === 'sheet.operation.set-cell-edit-visible' && command.params.visible) {
    console.log('Cell edit visible')
    const activeSheet = univerAPI.getActiveWorkbook().getActiveSheet()
    const selection = activeSheet.getSelection()
    const range = selection.getActiveRange()
    currentEditRange.startRow = range._range.startRow
    currentEditRange.startColumn = range._range.startColumn
    currentEditRange.endRow = range._range.endRow
    currentEditRange.endColumn = range._range.endColumn
  }
})

univerAPI.onCommandExecuted((command) => {
  if (command.id === 'sheet.operation.set-cell-edit-visible' && !command.params.visible) {
    console.log('Cell edit invisible')
    const activeSheet = univerAPI.getActiveWorkbook().getActiveSheet()
    const range = activeSheet.getRange(currentEditRange.startRow, currentEditRange.startColumn, currentEditRange.endRow, currentEditRange.endColumn)
    const value = range.getValue()
    console.log('修改单元格', currentEditRange, '改后的值', value)
  }
})
</script>
<style lang="scss" scoped></style>
