# Node.js + TypeORM 訓練

## 本地檢核方法

- 複製.env.example，並命名為.env，確認環境變數 DB_HOST=postgres
- 將學生的server.js與db.js複製到此專案中，並且直接覆蓋
- 執行npm ci，Eslint將在此時生效
- 執行npm run clean，將環境清除
- 執行npm run start，初始化環境，從Docker Desktop看到兩個容器都正常（圖示應為綠色）
- 修改.env的DB_HOST環境變數為localhost
- 修改.env的PORT環境變數為3000，避免與容器使用的PORT衝突
- 執行npm run test:integration，進行檢核測試