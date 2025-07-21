import React, { useEffect } from 'react';
import { Button, List, Card, Row, Col, Modal, Form, Input, Select, Spin, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectDiscussions,
  selectDiscussionsLoading,
  selectSelectedDiscussionId,
  selectDiscussionPosts,
  selectPostsLoading,
  setSelectedDiscussionId,
} from '../store/discussionsSlice';
import { fetchDiscussionsThunk, fetchDiscussionPostsThunk } from '../store/discussionsThunks';
import { selectTeams, selectTeamsLoading } from '../store/teamsSlice';
import { selectUsers, selectUsersLoading } from '../store/usersSlice';
import { RootState } from '../store/store';
import CreateDiscussionForm from './CreateDiscussionForm';
import { fetchTeamUsers } from '../dal';

const { Option } = Select;

const Discussions: React.FC = () => {
  const dispatch = useDispatch();
  const discussions = useSelector(selectDiscussions);
  const discussionsLoading = useSelector(selectDiscussionsLoading);
  const selectedDiscussionId = useSelector(selectSelectedDiscussionId);
  const discussionPosts = useSelector(selectDiscussionPosts);
  const postsLoading = useSelector(selectPostsLoading);
  const teams = useSelector(selectTeams);
  const teamsLoading = useSelector(selectTeamsLoading);
  const users = useSelector(selectUsers);
  const usersLoading = useSelector(selectUsersLoading);

  const [isCreateDiscussionModalOpen, setIsCreateDiscussionModalOpen] = React.useState(false);
  const [createDiscussionForm] = Form.useForm();
  const [creatingNewDiscussion, setCreatingNewDiscussion] = React.useState(false);
  const [teamUsers, setTeamUsers] = React.useState<any[]>([]);
  const [teamUsersLoading, setTeamUsersLoading] = React.useState(false);
  const [pendingSelectDiscussionId, setPendingSelectDiscussionId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Загрузка обсуждений
  useEffect(() => {
    dispatch(fetchDiscussionsThunk() as any);
  }, [dispatch]);

  // Загрузка сообщений обсуждения
  useEffect(() => {
    if (selectedDiscussionId) {
      dispatch(fetchDiscussionPostsThunk(selectedDiscussionId) as any);
    }
  }, [selectedDiscussionId, dispatch]);

  // Вычисляем выбранное обсуждение
  const selectedDiscussion = discussions.find((d: any) => d.id === selectedDiscussionId) || null;

  // Функция для выделения обсуждения после создания
  const selectDiscussionAfterCreate = async (discussionId: string, attempts = 0) => {
    if (attempts > 5) return;
    await dispatch(fetchDiscussionsThunk() as any);
    const found = discussions.find((d: any) => d.id === discussionId);
    if (found) {
      dispatch(setSelectedDiscussionId(discussionId));
      setPendingSelectDiscussionId(null);
    } else {
      setTimeout(() => selectDiscussionAfterCreate(discussionId, attempts + 1), 300);
    }
  };

  const handleCreateNewDiscussion = async () => {
    setCreatingNewDiscussion(true);
    try {
      const values = await createDiscussionForm.validateFields();
      console.log('DEBUG: values:', values);
      console.log('DEBUG: members:', values.members);
      // Теперь user_ids — это просто values.members (id)
      const user_ids = values.members;
      if (!user_ids || !user_ids.length) throw new Error('Не выбраны участники');
      // 2. Собрать channelData
      const channelData = {
        team_id: values.team_id,
        name: values.name,
        display_name: values.display_name,
        purpose: values.purpose || '',
        header: values.header || '',
        type: values.type,
        user_ids,
      };
      const createRes = await fetch('http://localhost:3001/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channelData),
      });
      const result = await createRes.json();
      if (!createRes.ok) {
        let errorMsg = 'Ошибка создания обсуждения';
        if (result?.error) {
          if (typeof result.error === 'string') {
            errorMsg = result.error;
          } else if (typeof result.error === 'object') {
            if (result.error.message) {
              errorMsg = result.error.message;
            } else if (result.error.id) {
              errorMsg = result.error.id;
            } else {
              errorMsg = JSON.stringify(result.error);
            }
          }
        } else if (result?.message) {
          errorMsg = result.message;
        }
        if (result?.members && Array.isArray(result.members)) {
          const failed = result.members.filter((m: any) => m.status === 'error');
          if (failed.length > 0) {
            errorMsg += ': не удалось добавить участников: ' + failed.map((m: any) => m.user_id).join(', ');
          }
        }
        message.error({ content: errorMsg, duration: 5 });
        return;
      }
      if (result?.members && Array.isArray(result.members)) {
        const failed = result.members.filter((m: any) => m.status === 'error');
        if (failed.length > 0) {
          message.warning('Обсуждение создано, но не все участники добавлены: ' + failed.map((m: any) => m.user_id).join(', '));
        } else {
          message.success('Обсуждение создано!');
        }
      } else {
        message.success('Обсуждение создано!');
      }
      setIsCreateDiscussionModalOpen(false);
      createDiscussionForm.resetFields();
      setPendingSelectDiscussionId(result.id);
      selectDiscussionAfterCreate(result.id);
    } catch (e: any) {
      message.error(e.message || 'Ошибка при создании обсуждения');
    } finally {
      setCreatingNewDiscussion(false);
    }
  };

  const handleDeleteDiscussion = (discussion: any) => {
    Modal.confirm({
      title: `Удалить обсуждение "${discussion.display_name}"?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Это действие необратимо. Все сообщения будут удалены.',
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        setDeletingId(discussion.id);
        try {
          const res = await fetch(`http://localhost:3001/channels/${discussion.id}`, {
            method: 'DELETE',
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data?.error || 'Ошибка удаления обсуждения');
          }
          dispatch(fetchDiscussionsThunk() as any);
          dispatch(setSelectedDiscussionId(null));
        } catch (e: any) {
          Modal.error({ title: 'Ошибка', content: e.message || 'Ошибка удаления обсуждения' });
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  useEffect(() => {
    if (isCreateDiscussionModalOpen && teams.length > 0) {
      createDiscussionForm.setFieldsValue({ team_id: teams[0].id });
    }
  }, [teams, isCreateDiscussionModalOpen, createDiscussionForm]);

  // useEffect для подгрузки пользователей при изменении выбранной команды в форме
  useEffect(() => {
    if (isCreateDiscussionModalOpen) {
      const teamId = createDiscussionForm.getFieldValue('team_id') || teams[0]?.id;
      if (teamId) {
        setTeamUsers([]); // Clear previous users
        setTeamUsersLoading(true);
        fetchTeamUsers(teamId)
          .then(data => {
            setTeamUsers(data);
          })
          .catch(e => {
            message.error(e.message || 'Ошибка загрузки пользователей команды');
            setTeamUsers([]);
          })
          .finally(() => setTeamUsersLoading(false));
      }
    }
    // eslint-disable-next-line
  }, [isCreateDiscussionModalOpen, teams]);

  return (
    <>
      <Modal
        title="Создать обсуждение"
        open={isCreateDiscussionModalOpen}
        onCancel={() => setIsCreateDiscussionModalOpen(false)}
        footer={null}
      >
        <CreateDiscussionForm
          form={createDiscussionForm}
          onFinish={handleCreateNewDiscussion}
          creating={creatingNewDiscussion}
          setIsCreateDiscussionModalOpen={setIsCreateDiscussionModalOpen}
        />
      </Modal>
      <Row style={{ height: '100%' }}>
        <Col flex="1 1 300px" style={{ maxWidth: 400, minWidth: 280, minHeight: 0, boxSizing: 'border-box', height: '100%', display: 'flex', flexDirection: 'column', padding: 8 }}>
          <Card title="Список обсуждений" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, boxSizing: 'border-box' }} bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <Button type="primary" onClick={() => setIsCreateDiscussionModalOpen(true)} style={{ marginBottom: 8 }}>
              Создать обсуждение
            </Button>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <List
                bordered
                loading={discussionsLoading}
                dataSource={discussions}
                style={{ flex: 1, minHeight: 0, overflow: 'auto' }}
                renderItem={(item: any) => (
                  <List.Item
                    style={{
                      background: selectedDiscussionId === item.id ? '#e6f7ff' : undefined,
                      cursor: 'pointer',
                    }}
                    onClick={() => dispatch(setSelectedDiscussionId(item.id))}
                  >
                    <div>
                      <b>{item.display_name}</b> <span style={{ color: '#888', marginLeft: 8 }}>({item.name})</span>
                    </div>
                    <div style={{ marginLeft: 16, flexShrink: 0, display: 'flex' }}>
                      <Button
                        danger
                        size="small"
                        loading={deletingId === item.id}
                        onClick={e => { e.stopPropagation(); handleDeleteDiscussion(item); }}
                        key="delete"
                        style={{ minWidth: 80 }}
                      >
                        Удалить
                      </Button>
                    </div>
                  </List.Item>
                )}
                locale={{ emptyText: 'Нет обсуждений' }}
              />
            </div>
          </Card>
        </Col>
        <Col flex="2 1 400px" style={{ minWidth: 320, minHeight: 0, boxSizing: 'border-box', height: '100%', display: 'flex', flexDirection: 'column', padding: 8 }}>
          {selectedDiscussion ? (
            <Card title={`Информация об обсуждении: ${selectedDiscussion.display_name}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }} bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div style={{ marginBottom: 24 }}>
                <b>ID:</b> {selectedDiscussion.id}<br />
                <b>Name:</b> {selectedDiscussion.name}<br />
                <b>Display Name:</b> {selectedDiscussion.display_name}<br />
                <b>Type:</b> {selectedDiscussion.type}<br />
                <b>Team ID:</b> {selectedDiscussion.team_id}<br />
                <b>Purpose:</b> {selectedDiscussion.purpose}<br />
                <b>Header:</b> {selectedDiscussion.header}
              </div>
              <div style={{ marginTop: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <b>JSON:</b>
                <pre style={{ background: '#f6f6f6', padding: 12, borderRadius: 4, fontSize: 13, margin: 0, flex: 1, minHeight: 0, overflow: 'auto' }}>
                  {JSON.stringify(selectedDiscussion, null, 2)}
                </pre>
              </div>
            </Card>
          ) : (
            <Card style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}><span style={{ color: '#888' }}>Выберите обсуждение для просмотра информации</span></Card>
          )}
        </Col>
      </Row>
    </>
  );
};

export default Discussions; 