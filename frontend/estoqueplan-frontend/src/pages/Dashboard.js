import React from 'react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css'; // We'll create this for custom styles

const Dashboard = () => {
  return (
    <div className="dashboard-root">
      <Sidebar />
      <div className="dashboard-content">
        {/* Overview Section */}
        <div className="dashboard-overview">
          <div className="overview-card">
            <div className="overview-title">Total em estoque</div>
            <div className="overview-value">1,430</div>
          </div>
          <div className="overview-card">
            <div className="overview-title">Quantidade de produtos</div>
            <div className="overview-value">842</div>
          </div>
          <div className="overview-card">
            <div className="overview-title">Valor em estoque</div>
            {/* Placeholder for chart */}
            <div className="overview-chart">[Chart]</div>
          </div>
          <div className="overview-card">
            <div className="overview-title">Baixo estoque</div>
            <div className="overview-value">120</div>
          </div>
        </div>
        {/* Inventory Table */}
        <div className="dashboard-inventory">
          <div className="inventory-header">
            <h2>Informativos do estoque</h2>
            <div>
              <button className="btn-add">Adicionar produtos</button>
              <button className="btn-export">Exportar</button>
            </div>
          </div>
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Madeira</th>
                <th>Quantidade</th>
                <th>Preço</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Laptop</td>
                <td>LAP001</td>
                <td>842</td>
                <td>$4.49</td>
                <td><span className="status in-stock">In Stock</span></td>
              </tr>
              <tr>
                <td>Smartphone</td>
                <td>SM31020</td>
                <td>842</td>
                <td>$0.49</td>
                <td><span className="status low-stock">Low Stock</span></td>
              </tr>
              <tr>
                <td>Desk Chair</td>
                <td>DSKCH13</td>
                <td>825</td>
                <td>$2.99</td>
                <td><span className="status low-stock">Low Stock</span></td>
              </tr>
              <tr>
                <td>Monitor</td>
                <td>MON10R</td>
                <td>595</td>
                <td>$2.49</td>
                <td><span className="status in-stock">In Stock</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
