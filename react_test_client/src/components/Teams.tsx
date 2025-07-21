import React from 'react';
import { Card, Button, List, Row, Col, Descriptions } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { selectTeams, selectTeamsLoading, selectSelectedTeamId, setSelectedTeamId } from '../store/teamsSlice';
import { fetchTeamsThunk } from '../store/teamsThunks';

const Teams: React.FC = () => {
  const dispatch = useDispatch();
  const teams = useSelector(selectTeams);
  const teamsLoading = useSelector(selectTeamsLoading);
  const selectedTeamId = useSelector(selectSelectedTeamId);
  const selectedTeam = teams.find((t: any) => t.id === selectedTeamId) || null;

  React.useEffect(() => {
    dispatch(fetchTeamsThunk() as any);
  }, [dispatch]);

  return (
    <Row style={{ height: '100%' }}>
      <Col flex="1 1 300px" style={{ maxWidth: 400, minWidth: 280, minHeight: 0, boxSizing: 'border-box', height: '100%', display: 'flex', flexDirection: 'column', padding: 8 }}>
        <Card title="Список команд" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, boxSizing: 'border-box' }} bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <Button onClick={() => dispatch(fetchTeamsThunk() as any)} loading={teamsLoading} style={{ marginBottom: 16 }}>
            Обновить
          </Button>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <List
              bordered
              loading={teamsLoading}
              dataSource={teams}
              style={{ flex: 1, minHeight: 0, overflow: 'auto' }}
              renderItem={(item: any) => (
                <List.Item
                  style={{
                    background: selectedTeamId === item.id ? '#e6f7ff' : undefined,
                    cursor: 'pointer',
                  }}
                  onClick={() => dispatch(setSelectedTeamId(item.id))}
                >
                  <div>
                    <b>{item.display_name}</b> <span style={{ color: '#888', marginLeft: 8 }}>({item.name})</span>
                    {selectedTeamId === item.id && <span style={{ color: '#52c41a', marginLeft: 12, fontWeight: 500 }}>(Текущая команда)</span>}
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: 'Нет команд' }}
            />
          </div>
        </Card>
      </Col>
      <Col flex="2 1 400px" style={{ minWidth: 320, minHeight: 0, boxSizing: 'border-box', height: '100%', display: 'flex', flexDirection: 'column', padding: 8 }}>
        {selectedTeam ? (
          <Card title={`Информация о команде: ${selectedTeam.display_name}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }} bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="ID">{selectedTeam.id}</Descriptions.Item>
              <Descriptions.Item label="Name">{selectedTeam.name}</Descriptions.Item>
              <Descriptions.Item label="Display Name">{selectedTeam.display_name}</Descriptions.Item>
              <Descriptions.Item label="Type">{selectedTeam.type}</Descriptions.Item>
              <Descriptions.Item label="Invite ID">{selectedTeam.invite_id}</Descriptions.Item>
              <Descriptions.Item label="Description">{selectedTeam.description}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <b>JSON:</b>
              <pre style={{ background: '#f6f6f6', padding: 12, borderRadius: 4, fontSize: 13, margin: 0, flex: 1, minHeight: 0, overflow: 'auto' }}>
                {JSON.stringify(selectedTeam, null, 2)}
              </pre>
            </div>
          </Card>
        ) : (
          <Card style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}><span style={{ color: '#888' }}>Выберите команду для просмотра информации</span></Card>
        )}
      </Col>
    </Row>
  );
};

export default Teams; 