import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { useSelector } from 'react-redux';
import { selectTeams, selectTeamsLoading } from '../store/teamsSlice';
import { selectUsers, selectUsersLoading } from '../store/usersSlice';
import { fetchTeamUsers } from '../dal';

const { Option } = Select;

interface CreateDiscussionFormProps {
  form: any;
  onFinish: (values: any) => void;
  creating: boolean;
  setIsCreateDiscussionModalOpen: (open: boolean) => void;
}

// Функция генерации случайных данных для обсуждения
export function generateRandomDiscussion(teamId?: string, teamUsers?: any[]) {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  // Только латиница, цифры, тире:
  const name = `discussion-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const display_name = `Тестовое обсуждение ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const purpose = 'Канал для тестирования функций';
  const header = 'Добро пожаловать в тестовый канал!';
  const type = Math.random() > 0.5 ? 'O' : 'P';
  let members: string[] = [];
  if (teamUsers && teamUsers.length > 0) {
    // Выбираем случайно 2-4 участников (id)
    const shuffled = [...teamUsers].sort(() => 0.5 - Math.random());
    members = shuffled.slice(0, Math.min(4, Math.max(2, Math.floor(Math.random()*teamUsers.length)))).map(u => u.id);
  }
  return {
    name,
    display_name,
    purpose,
    header,
    type,
    team_id: teamId || '',
    members,
  };
}

const CreateDiscussionForm: React.FC<CreateDiscussionFormProps> = ({
  form,
  onFinish,
  creating,
  setIsCreateDiscussionModalOpen,
}) => {
  // const [form] = Form.useForm(); // больше не нужно
  const teams = useSelector(selectTeams);
  const teamsLoading = useSelector(selectTeamsLoading);
  const users = useSelector(selectUsers);
  const usersLoading = useSelector(selectUsersLoading);
  const [teamUsers, setTeamUsers] = useState<any[]>([]);

  useEffect(() => {
    if (teams && teams.length > 0) {
      form.setFieldsValue({ team_id: teams[0].id });
    }
  }, [teams, form]);

  useEffect(() => {
    // Следим за изменением выбранной команды в форме
    const teamId = form.getFieldValue('team_id') || (teams[0] && teams[0].id) || '';
    if (teamId) {
      fetchTeamUsers(teamId)
        .then(data => {
          setTeamUsers(data);
        })
        .catch(e => {
          message.error(e.message || 'Ошибка загрузки пользователей команды');
          setTeamUsers([]);
        });
    } else {
      setTeamUsers([]);
    }
    // eslint-disable-next-line
  }, [form.getFieldValue('team_id'), teams]);

  const handleGenerate = () => {
    const teamId = form.getFieldValue('team_id') || (teams[0] && teams[0].id) || '';
    // teamUsers уже актуальны благодаря useEffect выше
    const values = generateRandomDiscussion(teamId, teamUsers);
    form.setFieldsValue(values);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item>
        <Button type="dashed" onClick={handleGenerate} style={{ width: '100%', marginBottom: 12 }}>
          Сгенерировать обсуждение
        </Button>
      </Form.Item>
      <Form.Item
        label="Системное имя (латиницей, без пробелов)"
        name="name"
        rules={[{ required: true, message: 'Введите системное имя (латиницей, без пробелов)' }, { pattern: /^[a-z0-9\-]+$/, message: 'Только латиница, цифры, тире' }]}
      >
        <Input placeholder="test-channel-123" />
      </Form.Item>
      <Form.Item
        label="Название обсуждения"
        name="display_name"
        rules={[{ required: true, message: 'Введите название' }]}
      >
        <Input placeholder="Название обсуждения" />
      </Form.Item>
      <Form.Item
        label="Назначение (purpose)"
        name="purpose"
      >
        <Input placeholder="Канал для тестирования функций" />
      </Form.Item>
      <Form.Item
        label="Заголовок (header)"
        name="header"
      >
        <Input placeholder="Добро пожаловать в тестовый канал!" />
      </Form.Item>
      <Form.Item
        label="Тип канала"
        name="type"
        initialValue="O"
        rules={[{ required: true, message: 'Выберите тип канала' }]}
      >
        <Select>
          <Option value="O">Публичный</Option>
          <Option value="P">Приватный</Option>
        </Select>
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
            form.setFieldsValue({ members: [] });
            fetchTeamUsers(teamId)
              .then(data => {
                setTeamUsers(data);
              })
              .catch(e => {
                message.error(e.message || 'Ошибка загрузки пользователей команды');
                setTeamUsers([]);
              });
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
        label="Участники"
        name="members"
        rules={[{ required: true, message: 'Выберите участников' }]}
      >
        <Select
          mode="multiple"
          placeholder="Выберите участников"
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
          Создать
        </Button>
        <Button style={{ width: '100%', marginTop: 8 }} onClick={() => setIsCreateDiscussionModalOpen(false)}>
          Отмена
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateDiscussionForm; 