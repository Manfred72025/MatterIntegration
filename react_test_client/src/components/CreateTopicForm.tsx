import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { useSelector } from 'react-redux';
import { selectTeams, selectTeamsLoading } from '../store/teamsSlice';
import { fetchTeamUsers } from '../dal';

const { Option } = Select;

interface CreateTopicFormProps {
  form: any;
  onFinish: (values: any) => void;
  creating: boolean;
  setIsCreateTopicModalOpen: (open: boolean) => void;
}

const CreateTopicForm: React.FC<CreateTopicFormProps> = ({
  form,
  onFinish,
  creating,
  setIsCreateTopicModalOpen,
}) => {
  const teams = useSelector(selectTeams);
  const teamsLoading = useSelector(selectTeamsLoading);
  const [teamUsers, setTeamUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    if (teams && teams.length > 0) {
      form.setFieldsValue({ team_id: teams[0].id });
    }
  }, [teams, form]);

  useEffect(() => {
    const teamId = form.getFieldValue('team_id') || (teams[0] && teams[0].id) || '';
    if (teamId) {
      setUsersLoading(true);
      fetchTeamUsers(teamId)
        .then(data => {
          setTeamUsers(data);
        })
        .catch(e => {
          message.error(e.message || 'Ошибка загрузки пользователей команды');
          setTeamUsers([]);
        })
        .finally(() => setUsersLoading(false));
    } else {
      setTeamUsers([]);
    }
    // eslint-disable-next-line
  }, [form.getFieldValue('team_id'), teams]);

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Название обсуждения"
        name="discussion_name"
        rules={[{ required: true, message: 'Введите название обсуждения' }]}
      >
        <Input placeholder="Название обсуждения" />
      </Form.Item>
      <Form.Item
        label="Команда"
        name="team_id"
        rules={[{ required: true, message: 'Выберите команду' }]}
      >
        <Select
          placeholder="Выберите команду"
          loading={teamsLoading}
          onChange={teamId => {
            form.setFieldsValue({ user_ids: [] });
            setUsersLoading(true);
            fetchTeamUsers(teamId)
              .then(data => {
                setTeamUsers(data);
              })
              .catch(e => {
                message.error(e.message || 'Ошибка загрузки пользователей команды');
                setTeamUsers([]);
              })
              .finally(() => setUsersLoading(false));
          }}
        >
          {teams.map((team: any) => (
            <Option key={team.id} value={team.id}>
              {team.display_name} ({team.name})
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label="Пользователи"
        name="user_ids"
        rules={[{ required: true, message: 'Выберите пользователей' }]}
      >
        <Select
          mode="multiple"
          placeholder="Выберите пользователей"
          loading={usersLoading}
          filterOption={(input, option) =>
            String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {teamUsers.map((user: any) => (
            <Option key={user.id} value={user.id}>{user.username}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={creating} style={{ width: '100%' }}>
          Создать топик
        </Button>
        <Button style={{ width: '100%', marginTop: 8 }} onClick={() => setIsCreateTopicModalOpen(false)}>
          Отмена
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateTopicForm; 