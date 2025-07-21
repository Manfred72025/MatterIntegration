import React, { useEffect } from 'react';
import { Form, Input, Button, Select } from 'antd';
import { useSelector } from 'react-redux';
import { selectTeams, selectSelectedTeamId } from '../store/teamsSlice';

const { Option } = Select;

export function generateRandomUser() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const username = `user_${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const email = `${username}@yandex.ru`;
  const passChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const passLength = Math.floor(Math.random() * 3) + 8;
  let password = '';
  for (let i = 0; i < passLength; i++) {
    password += passChars.charAt(Math.floor(Math.random() * passChars.length));
  }
  return { username, email, password };
}

interface CreateUserFormProps {
  form: any;
  formError: string | null;
  setFormError: (err: string | null) => void;
  onFinish: (values: any) => void;
  
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({
  form,
  formError,
  setFormError,
  onFinish,
  
}) => {
  const teams = useSelector(selectTeams);
  const selectedTeamId = useSelector(selectSelectedTeamId);

  useEffect(() => {
    if (teams && teams.length > 0) {
      form.setFieldsValue({ team_id: selectedTeamId || teams[0].id });
    }
  }, [teams, selectedTeamId, form]);

  const handleGenerate = () => {
    const values = generateRandomUser();
    form.setFieldsValue(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item>
        <Button type="dashed" onClick={handleGenerate} style={{ width: '100%', marginBottom: 12 }}>
          Сгенерировать пользователя
        </Button>
      </Form.Item>
      <Form.Item
        label="Email"
        name="email"
        rules={[{ required: true, message: 'Введите email' }]}
      >
        <Input type="email" />
      </Form.Item>
      <Form.Item
        label="Username"
        name="username"
        rules={[{ required: true, message: 'Введите username' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Пароль"
        name="password"
        rules={[{ required: true, message: 'Введите пароль' }]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        label="Команда"
        name="team_id"
        rules={[{ required: true, message: 'Выберите команду' }]}
      >
        <Select
          showSearch
          placeholder="Выберите команду"
          optionFilterProp="children"
          filterOption={(input, option) =>
            String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {teams.map((team: any) => (
            <Option key={team.id} value={team.id}>
              {team.display_name} ({team.name})
            </Option>
          ))}
        </Select>
      </Form.Item>
      {formError && (
        <div style={{ color: 'red', marginBottom: 16 }}>{formError}</div>
      )}
      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ width: '100%' }} >
          Создать
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateUserForm; 