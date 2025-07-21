import React from 'react';
import { Menu, Layout } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  AppstoreOutlined,
  MessageOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

interface SideMenuProps {
  activeTab: string;
  setActiveTab: (key: string) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ activeTab, setActiveTab }) => (
  <Sider width={220} style={{ background: '#fff', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, borderBottom: '1px solid #eee' }}>
      Mattermost Integration
    </div>
    <Menu
      mode="inline"
      selectedKeys={[activeTab]}
      onClick={e => setActiveTab(e.key)}
      style={{ flex: 1, borderRight: 0, minHeight: 0 }}
      items={[
        { key: 'teams', icon: <TeamOutlined />, label: 'Команды' },
        { key: 'users', icon: <UserOutlined />, label: 'Пользователи' },
        { key: 'channels', icon: <AppstoreOutlined />, label: 'Каналы' },
        { key: 'discussions', icon: <MessageOutlined />, label: 'Обсуждения' },
      ]}
    />
  </Sider>
);

export default SideMenu; 