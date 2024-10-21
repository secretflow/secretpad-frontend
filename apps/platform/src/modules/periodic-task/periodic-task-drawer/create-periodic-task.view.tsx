import { Button, Drawer, Form, Input, DatePicker, Select, Space, message } from 'antd';
import dayjs from 'dayjs';
import { parse } from 'query-string';
import { useCallback, useEffect } from 'react';
import { useLocation } from 'umi';

import { DefaultModalManager } from '@/modules/dag-modal-manager';
import { getModel, useModel } from '@/util/valtio-helper';

import {
  CycleTaskType,
  monthMapping,
  PeriodicTaskCreateServive,
  weekMapping,
} from './create-periodic-task-service';
import { getScheduleDateStr, getSpecifiedDatesWithinRange, range } from './utils';

export const PeriodicTaskCreate = () => {
  const modalManager = useModel(DefaultModalManager);
  const service = useModel(PeriodicTaskCreateServive);

  const { RangePicker, TimePicker } = DatePicker;
  const { Option } = Select;

  const [form] = Form.useForm();
  const periodic = Form.useWatch('periodic', form);
  const days = Form.useWatch('days', form);

  const { visible, data: graphNodes } =
    modalManager.modals[PeriodicTaskCreateDrawer.id];

  const onClose = () => {
    modalManager.closeModal(PeriodicTaskCreateDrawer.id);
    form.resetFields();
    service.loading = false;
  };

  const { search } = useLocation();
  const { projectId, dagId } = parse(search) as { projectId: string; dagId: string };

  useEffect(() => {
    if (!visible || !projectId || !dagId) return;
    service.getScheduledId(projectId, dagId);
  }, [visible, projectId, dagId]);

  const onSave = async () => {
    const values = await form.validateFields();
    // 校验提交时间是否小于结束时间
    if (dayjs(values.start[1]).isBefore(dayjs())) {
      form.setFields([
        {
          name: 'start',
          value: values.start,
          errors: ['调度范围结束时间不得小于保存时间'],
        },
      ]);
      return;
    }

    const startTime = dayjs(values.start[0]).format('YYYY-MM-DD HH:mm:ss');
    const endTime = dayjs(values.start[1]).format('YYYY-MM-DD HH:mm:ss');
    const currentTime = dayjs(values.time).format('HH:mm:ss');
    const scheduleDate =
      values.periodic === CycleTaskType.Week
        ? getScheduleDateStr(values.periodic, values.days).map((item) =>
            item === 7 ? 0 : item,
          )
        : getScheduleDateStr(values.periodic, values.days);
    // 判断调度选择日期内有没有可调度的日期
    const hasDayCount = getSpecifiedDatesWithinRange(
      startTime,
      endTime,
      values.periodic,
      scheduleDate,
      currentTime,
    );

    if (new Set(hasDayCount).size === 0) {
      message.warning('调度时间范围内无可调度的时间，请检查');
      return;
    }
    const params = {
      scheduleId: values.scheduledId,
      scheduleDesc: values.scheduleDesc,
      cron: {
        startTime,
        endTime,
        scheduleCycle: values.periodic,
        scheduleDate: getScheduleDateStr(values.periodic, values.days)
          .join(',')
          .replace('-1', 'end'),
        scheduleTime: dayjs(values.time).format('HH:mm:ss'),
      },
      projectId: projectId,
      graphId: dagId,
      nodes: graphNodes.map((item: { id: string }) => item.id),
    };
    service.loading = true;
    const { status } = await service.createScheduled(params);
    service.loading = false;
    if (status && status.code === 0) {
      message.success('周期任务创建成功');
      onClose();
    } else {
      message.error(status && status.msg);
    }
  };

  const disabledDate = (current: dayjs.Dayjs) => {
    return current && current < dayjs().subtract(1, 'days').endOf('day');
  };

  const disabledDateTime = (now: dayjs.Dayjs) => {
    const selectDay = dayjs(now).add(2, 'minute').format('YYYY-MM-DD');
    const selectHours = dayjs(now).add(2, 'minute').format('H');
    const currentDay = dayjs().format('YYYY-MM-DD');

    const hours = dayjs().format('H'); // 0~23
    // 添加两分钟误差时间
    const minutes = dayjs().add(2, 'minute').format('m'); // 0~59
    //当日只能选择当前时间之后的时间点
    return {
      disabledHours: () =>
        selectDay === currentDay ? range(0, 60).splice(0, Number(hours)) : [],
      disabledMinutes: () =>
        selectDay === currentDay && selectHours === hours
          ? range(0, 60).splice(0, Number(minutes))
          : [],
    };
  };

  // 获取可调度的日期
  const getDispatchDaysOptions = useCallback(() => {
    const cycle = form.getFieldValue('periodic');
    const selectDays = form.getFieldValue('days') || [];

    if (cycle === CycleTaskType.Day) {
      return null; // 占位符
    } else if (cycle === CycleTaskType.Week) {
      const dispatchDaysList = Object.keys(weekMapping).map((key) => ({
        key,
        label: weekMapping[key as keyof typeof weekMapping],
      }));

      return dispatchDaysList.map((item) => {
        // 如果已经选择了 5 个，其他选项禁用, 否则选项一直可选
        const disabled =
          selectDays.length >= 5
            ? !selectDays.includes(weekMapping[item.key as keyof typeof weekMapping])
            : false;

        return (
          <Option
            key={item.key}
            value={weekMapping[item.key as keyof typeof weekMapping]}
            disabled={disabled}
          >
            {weekMapping[item.key as keyof typeof weekMapping]}
          </Option>
        );
      });
    } else if (cycle === CycleTaskType.Month) {
      const dispatchDaysList = Object.keys(monthMapping).map((key) => ({
        key,
        label: monthMapping[key],
      }));

      return dispatchDaysList.map((item) => {
        // 如果已经选择了 5 个，其他选项禁用, 否则选项一直可选
        const disabled =
          selectDays.length >= 5
            ? !selectDays.includes(monthMapping[item.key as keyof typeof monthMapping])
            : false;

        return (
          <Select.Option
            key={item.key}
            value={monthMapping[item.key]}
            disabled={disabled}
          >
            {monthMapping[item.key]}
            {Number(item.key) > 28 && (
              <span style={{ color: 'rgba(0,0,0,.2)', fontWeight: 400 }}>
                （没有这一天的月份将按最后一天执行）
              </span>
            )}
          </Select.Option>
        );
      });
    }
  }, [periodic, days]);

  useEffect(() => {
    visible && form.setFieldValue('scheduledId', service.scheduledId);
  }, [service.scheduledId, visible]);

  return (
    <Drawer
      width={560}
      open={visible}
      onClose={onClose}
      title="部署成周期任务"
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" loading={service.loading} onClick={onSave}>
            保存
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="任务ID"
          name="scheduledId"
          rules={[{ required: true, message: '任务ID获取失败' }]}
        >
          <Input disabled placeholder="自动生成不可更改" />
        </Form.Item>
        <Form.Item name="scheduleDesc" label="任务描述(可选)">
          <Input.TextArea showCount maxLength={200} />
        </Form.Item>
        <Form.Item
          label="调度时间范围"
          name="start"
          rules={[
            { required: true, message: '请选择调度时间范围' },
            {
              validator(_, value) {
                if (!value || value.length < 2) {
                  return Promise.reject(new Error(''));
                }
                const startTime = dayjs(value[0]).unix();
                const endTime = dayjs(value[1]).unix();
                if (endTime - startTime < 86400) {
                  return Promise.reject(new Error('选择调度范围要大于24小时'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <RangePicker
            disabledDate={disabledDate}
            disabledTime={(now) => disabledDateTime(now as dayjs.Dayjs)}
            allowClear={false}
            placeholder={['开始日期', '结束日期']}
            defaultValue={[dayjs().add(2, 'minute'), null]}
            showTime
          />
        </Form.Item>
        <Form.Item
          style={{ width: 160 }}
          name="periodic"
          label="调度周期"
          required={false}
          rules={[{ required: true, message: '请选择调度周期' }]}
        >
          <Select
            placeholder="请选择"
            onChange={() => form.setFieldValue('days', undefined)}
          >
            <Select.Option value={CycleTaskType.Day}>日</Select.Option>
            <Select.Option value={CycleTaskType.Week}>周</Select.Option>
            <Select.Option value={CycleTaskType.Month}>月</Select.Option>
          </Select>
        </Form.Item>
        {form.getFieldValue('periodic') !== CycleTaskType.Day && (
          <Form.Item
            name="days"
            label="指定日期"
            required={false}
            rules={[{ required: true, message: '请选择指定日期' }]}
          >
            <Select
              showSearch={false}
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="请选择"
            >
              {getDispatchDaysOptions()}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          style={{ width: 224 }}
          name="time"
          label="指定时刻"
          required={false}
          rules={[{ required: true, message: '请指定时刻' }]}
        >
          <TimePicker
            showNow={false}
            allowClear={false}
            format={'HH:mm'}
            placeholder="请选择"
            renderExtraFooter={() => (
              <Button
                style={{ padding: 0 }}
                type="link"
                onClick={() => form.setFieldValue('time', dayjs())}
              >
                此刻
              </Button>
            )}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export const PeriodicTaskCreateDrawer = {
  id: 'PeriodicTaskCreate',
  visible: false,
  data: {},
};

getModel(DefaultModalManager).registerModal(PeriodicTaskCreateDrawer);
