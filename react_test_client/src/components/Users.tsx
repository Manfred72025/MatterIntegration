import React, { useEffect } from 'react';
import { Button, List, Card, Row, Col, Modal, Form, Input, Select, message, Descriptions, Tag } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { selectTeams, selectTeamsLoading, selectSelectedTeamId } from '../store/teamsSlice';
import { selectUsers, selectUsersLoading, selectSelectedUser, setSelectedUser, selectCurrentUser, setCurrentUser, addUser } from '../store/usersSlice';
import { fetchUsersThunk, createUserThunk, deleteUserThunk } from '../store/usersThunks';
import { DeleteOutlined } from '@ant-design/icons';
import CreateUserForm from './CreateUserForm';

const { Option } = Select;

const Users: React.FC = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Получаем данные из стора
  const teams = useSelector(selectTeams);
  const teamsLoading = useSelector(selectTeamsLoading);
  const selectedTeamId = useSelector(selectSelectedTeamId);
  const users = useSelector(selectUsers);
  const usersLoading = useSelector(selectUsersLoading);
  const selectedUser = useSelector(selectSelectedUser);
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    dispatch(fetchUsersThunk() as any);
  }, [dispatch]);

  useEffect(() => {
    if (isModalOpen && teams && teams.length > 0) {
      form.setFieldsValue({ team_id: selectedTeamId || teams[0].id });
    }
  }, [isModalOpen, teams, selectedTeamId, form]);

  const handleCreateUser = async (values: any) => {
    setFormError(null);
    try {
      const result = await dispatch(createUserThunk(values) as any);
      message.success('Пользователь успешно создан!');
      setIsModalOpen(false);
      form.resetFields();
      // После создания добавляем пользователя в стор и выделяем его как currentUser
      if (result && result.payload && result.payload.id) {
        dispatch(addUser(result.payload));
        dispatch(setCurrentUser(result.payload));
        dispatch(setSelectedUser(result.payload));
      }
    } catch (e: any) {
      setFormError(e.message || 'Ошибка при создании пользователя');
      message.error(e.message || 'Ошибка при создании пользователя');
    }
  };

  // useEffect для выделения selectedUser при изменении users
  useEffect(() => {
    if (!selectedUser || !users.some((u: any) => u.id === selectedUser.id)) {
      // Выделяем первого пользователя, отличного от currentUser
      const firstOther = users.find((u: any) => !currentUser || u.id !== currentUser.id);
      if (firstOther) {
        dispatch(setSelectedUser(firstOther));
      } else if (users.length > 0) {
        dispatch(setSelectedUser(users[0]));
      } else {
        dispatch(setSelectedUser(null));
      }
    }
  }, [users, selectedUser, currentUser, dispatch]);

  const handleDeleteUser = async (userId: string) => {
    try {
      await dispatch(deleteUserThunk(userId) as any);
      message.success('Пользователь удалён');
    } catch (e: any) {
      message.error(e.message || 'Ошибка удаления пользователя');
    }
  };

  

  return (
    <Row style={{ height: '100%' }}>
      <Col flex="1 1 300px" style={{ maxWidth: 400, minWidth: 280, minHeight: 0, boxSizing: 'border-box', height: '100%', display: 'flex', flexDirection: 'column', padding: 8 }}>
        <Card title="Список пользователей" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, boxSizing: 'border-box' }} bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <Button
            type="dashed"
            style={{ marginBottom: 16, width: '100%' }}
            onClick={() => setIsModalOpen(true)}
          >
            Создать
          </Button>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <List
              bordered
              loading={usersLoading}
              dataSource={users}
              style={{ flex: 1, minHeight: 0, overflow: 'auto' }}
              renderItem={(user: any) => (
                <List.Item
                  key={user.id}
                  style={{
                    background:
                      (selectedUser && selectedUser.username === user.username)
                        ? '#e6f7ff'
                        : (currentUser && currentUser.username === user.username)
                          ? '#f6ffed'
                          : undefined,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    dispatch(setSelectedUser(user));
                    dispatch(setCurrentUser(user));
                  }}
                  actions={[
                    <Button
                      danger
                      size="small"
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={e => {
                        e.stopPropagation();
                        Modal.confirm({
                          title: `Удалить пользователя ${user.username}?`,
                          content: 'Пользователь будет деактивирован в Mattermost.',
                          okText: 'Удалить',
                          okType: 'danger',
                          cancelText: 'Отмена',
                          onOk: () => handleDeleteUser(user.id),
                        });
                      }}
                      key="delete"
                    />
                  ]}
                >
                  <span style={{
                    color: currentUser && currentUser.username === user.username ? '#52c41a' : undefined,
                    fontWeight: currentUser && currentUser.username === user.username ? 500 : undefined,
                  }}>
                    {user.username}
                  </span>
                </List.Item>
              )}
              locale={{ emptyText: 'Нет пользователей' }}
            />
          </div>
        </Card>
      </Col>
      <Col flex="2 1 400px" style={{ minWidth: 320, minHeight: 0, boxSizing: 'border-box', height: '100%', display: 'flex', flexDirection: 'column', padding: 8 }}>
        {selectedUser ? (
          <Card title={`Информация о пользователе: ${selectedUser.username}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }} bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="ID">{selectedUser.id}</Descriptions.Item>
              <Descriptions.Item label="Username">{selectedUser.username}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
              <Descriptions.Item label="Roles">{selectedUser.roles}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <b>JSON:</b>
              <pre style={{ background: '#f6f6f6', padding: 12, borderRadius: 4, fontSize: 13, margin: 0, flex: 1, minHeight: 0, overflow: 'auto' }}>
                {JSON.stringify(selectedUser, null, 2)}
              </pre>
            </div>
          </Card>
        ) : (
          <Card style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}><span style={{ color: '#888' }}>Выберите пользователя для просмотра информации</span></Card>
        )}
      </Col>
      <Modal
        title="Создать пользователя"
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setFormError(null); }}
        footer={null}
      >
        <CreateUserForm
          form={form}
          formError={formError}
          setFormError={setFormError}
          onFinish={handleCreateUser}          
        />
      </Modal>
    </Row>
  );
};

export default Users; 