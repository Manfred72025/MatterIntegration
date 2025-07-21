import React, { useState, useEffect } from 'react';
import { Button, List, Card, Row, Col, Typography, Modal, Form, Input, message, Tabs, Collapse, Spin, Select, Menu, Layout } from 'antd';
import 'antd/dist/reset.css';
import Users from './components/Users';
import Discussions from './components/Discussions';
import Teams from './components/Teams';
import SideMenu from './components/SideMenu';
import {
  fetchUsers as dalFetchUsers,
  fetchChannels as dalFetchChannels,
  fetchChannelMembers as dalFetchChannelMembers,
  fetchTeams as dalFetchTeams,
  fetchDiscussions as dalFetchDiscussions,
  fetchDiscussionPosts as dalFetchDiscussionPosts,
  fetchTeamUsers as dalFetchTeamUsers,
} from './dal';
import { useDispatch } from 'react-redux';
import { fetchTeamsThunk } from './store/teamsThunks';

const { Content } = Layout;

function App() {
  const dispatch = useDispatch();
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [formError, setFormError] = useState<string | null>(null); // Новое состояние для ошибки
  const [channels, setChannels] = useState<any[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [channelMembers, setChannelMembers] = useState<{ [channelId: string]: string[] }>({});
  const [loadingMembers, setLoadingMembers] = useState<{ [channelId: string]: boolean }>({});
  const [users, setUsers] = useState<any[]>([]);

  // Загрузка пользователей при монтировании и по необходимости
  const fetchUsers = async () => {
    try {
      const data = await dalFetchUsers();
      setUsers(data);
      setAvailableItems(data.map((u: any) => u.username));
    } catch (e: any) {
      message.error(e.message || 'Ошибка загрузки пользователей');
    }
  };

  // Загрузка каналов
  const fetchChannels = async () => {
    setChannelsLoading(true);
    try {
      const data = await dalFetchChannels();
      setChannels(data);
    } catch (e: any) {
      message.error(e.message || 'Ошибка загрузки каналов');
    } finally {
      setChannelsLoading(false);
    }
  };

  // Загрузка участников канала
  const fetchChannelMembers = async (channelId: string) => {
    setLoadingMembers(prev => ({ ...prev, [channelId]: true }));
    try {
      const data = await dalFetchChannelMembers(channelId);
      // data может быть массивом объектов, берем только username
      const usernames = Array.isArray(data)
        ? data.map((m: any) => m.username).filter(Boolean)
        : [];
      setChannelMembers(prev => ({ ...prev, [channelId]: usernames }));
    } catch (e: any) {
      message.error(e.message || 'Ошибка загрузки участников');
    } finally {
      setLoadingMembers(prev => ({ ...prev, [channelId]: false }));
    }
  };

  // Загрузка команд
  const fetchTeams = async () => {
    // setTeamsLoading(true); // Удаляю useState/useEffect для teams и teamsLoading
    try {
      const data = await dalFetchTeams();
      // setTeams(Array.isArray(data) ? data : (data.teams || [])); // Удаляю useState/useEffect для teams и teamsLoading
    } catch (e: any) {
      message.error(e.message || 'Ошибка загрузки команд');
    } finally {
      // setTeamsLoading(false); // Удаляю useState/useEffect для teams и teamsLoading
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  React.useEffect(() => {
    dispatch(fetchTeamsThunk() as any);
  }, [dispatch]);

  // Загружать каналы только при открытии вкладки
  const [activeTab, setActiveTab] = useState('users');
  useEffect(() => {
    if (activeTab === 'channels') fetchChannels();
    if (activeTab === 'teams') fetchTeams();
  }, [activeTab]);



  return (
    <>
      <Layout style={{ height: '100vh', minWidth: 0 }}>
        <SideMenu activeTab={activeTab} setActiveTab={setActiveTab} />
        <Layout style={{ height: '100%', minWidth: 0 }}>
          <Content style={{ height: '100%', boxSizing: 'border-box', minHeight: 0, minWidth: 0, padding: 0 }}>
            {activeTab === 'teams' && (
              <Teams />
            )}
            {activeTab === 'users' && (
              <Users />
            )}
            {activeTab === 'channels' && (
              <Card title="Список каналов">
                <Button onClick={fetchChannels} loading={channelsLoading} style={{ marginBottom: 16 }}>
                  Обновить
                </Button>
                <List
                  bordered
                  loading={channelsLoading}
                  dataSource={channels}
                  renderItem={item => (
                    <List.Item style={{ display: 'block' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>
                          <b>{item.display_name}</b>
                          {item.type === 'P' && <span style={{ color: '#d46b08', marginLeft: 8 }}>(приватный)</span>}
                          <span style={{ color: '#888', marginLeft: 8 }}>({item.name})</span>
                        </span>
                        <Button
                          size="small"
                          onClick={() => fetchChannelMembers(item.id)}
                          loading={loadingMembers[item.id]}
                          style={{ marginLeft: 8 }}
                        >
                          Показать участников
                        </Button>
                      </div>
                      {channelMembers[item.id] && (
                        <div style={{ marginTop: 8, marginLeft: 16 }}>
                          <b>Участники:</b>
                          <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {channelMembers[item.id].length === 0 ? (
                              <li style={{ color: '#888' }}>Нет участников</li>
                            ) : (
                              channelMembers[item.id].map(username => (
                                <li key={username}>{username}</li>
                              ))
                            )}
                          </ul>
                        </div>
                      )}
                    </List.Item>
                  )}
                  locale={{ emptyText: 'Нет каналов' }}
                />
              </Card>
            )}
            {activeTab === 'discussions' && (
              <Discussions />
            )}
          </Content>
        </Layout>
      </Layout>
    </>
  );
}

export default App;
