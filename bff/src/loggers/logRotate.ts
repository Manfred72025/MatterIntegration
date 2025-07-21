import fs from 'fs';
import path from 'path';

export function rotateLogs(logDir: string, currentName: string, oldName: string) {
  const currentLog = path.join(logDir, currentName);
  const oldLog = path.join(logDir, oldName);
  try {
    if (fs.existsSync(currentLog)) {
      if (fs.existsSync(oldLog)) {
        fs.unlinkSync(oldLog);
      }
      fs.renameSync(currentLog, oldLog);
    }
  } catch (e) {
    // Не критично, просто выводим ошибку
    console.error('Ошибка ротации логов:', e);
  }
} 