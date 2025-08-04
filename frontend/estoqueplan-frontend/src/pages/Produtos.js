import React, { useState } from 'react';
import './Produtos.css';
import { Box, TextField, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import Sidebar from '../components/Sidebar';

const initialProducts = [
  { id: 1, descricao: 'Viga de sustentação', madeira: 'Eucalipto', bitola: '10x10', comprimento: '3m', preco: 120.5, quantidade: 15 },
  { id: 2, descricao: 'Prancha', madeira: 'Pinus', bitola: '5x20', comprimento: '2.5m', preco: 80.0, quantidade: 30 },
];

const Produtos = () => {
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ descricao: '', madeira: '', bitola: '', comprimento: '', preco: '', quantidade: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.descricao || !form.madeira || !form.bitola || !form.comprimento || !form.preco || !form.quantidade) return;
    setProducts([
      ...products,
      {
        id: products.length + 1,
        ...form,
        preco: parseFloat(form.preco),
        quantidade: parseInt(form.quantidade, 10),
      },
    ]);
    setForm({ descricao: '', madeira: '', bitola: '', comprimento: '', preco: '', quantidade: '' });
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditForm(product);
  };

  const handleSave = (id) => {
    setProducts(products.map((p) => (p.id === id ? { ...editForm, id, preco: parseFloat(editForm.preco), quantidade: parseInt(editForm.quantidade, 10) } : p)));
    setEditingId(null);
    setEditForm({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  return (
    <div className="produtos-root">
      <Sidebar />
      <div className="produtos-content">
        <Box className="produtos-list-card">
          <div className="produtos-list-header">
            <Typography variant="h6" className="produtos-list-title" gutterBottom>
              Produtos Cadastrados
            </Typography>
            <Button
              variant="contained"
              className="produtos-btn-novo"
              startIcon={<AddIcon />}
              onClick={() => setShowForm((prev) => !prev)}
            >
              {showForm ? 'Fechar Cadastro' : 'Novo Produto'}
            </Button>
          </div>
          <Collapse in={showForm}>
            <Box className="produtos-card" style={{ marginBottom: 32 }}>
              <Typography variant="h5" className="produtos-title" gutterBottom>
                Cadastro de Produto
              </Typography>
              <form className="produtos-form" onSubmit={handleSubmit} autoComplete="off">
                <TextField
                  label="Descrição"
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  className="produtos-input"
                  variant="filled"
                  required
                />
                <TextField
                  label="Madeira"
                  name="madeira"
                  value={form.madeira}
                  onChange={handleChange}
                  className="produtos-input"
                  variant="filled"
                  required
                />
                <TextField
                  label="Bitola"
                  name="bitola"
                  value={form.bitola}
                  onChange={handleChange}
                  className="produtos-input"
                  variant="filled"
                  required
                />
                <TextField
                  label="Comprimento"
                  name="comprimento"
                  value={form.comprimento}
                  onChange={handleChange}
                  className="produtos-input"
                  variant="filled"
                  required
                />
                <TextField
                  label="Preço"
                  name="preco"
                  value={form.preco}
                  onChange={handleChange}
                  className="produtos-input"
                  variant="filled"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  required
                />
                <TextField
                  label="Quantidade em Estoque"
                  name="quantidade"
                  value={form.quantidade}
                  onChange={handleChange}
                  className="produtos-input"
                  variant="filled"
                  type="number"
                  inputProps={{ min: 0, step: 1 }}
                  required
                />
                <Button type="submit" variant="contained" className="produtos-btn">
                  Cadastrar
                </Button>
              </form>
            </Box>
          </Collapse>
          <TableContainer component={Paper} className="produtos-table-container">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Madeira</TableCell>
                  <TableCell>Bitola</TableCell>
                  <TableCell>Comprimento</TableCell>
                  <TableCell>Preço</TableCell>
                  <TableCell>Qtd. Estoque</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {editingId === product.id ? (
                        <TextField
                          name="descricao"
                          value={editForm.descricao}
                          onChange={handleEditChange}
                          variant="filled"
                          className="produtos-table-input"
                          size="small"
                        />
                      ) : (
                        product.descricao
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === product.id ? (
                        <TextField
                          name="madeira"
                          value={editForm.madeira}
                          onChange={handleEditChange}
                          variant="filled"
                          className="produtos-table-input"
                          size="small"
                        />
                      ) : (
                        product.madeira
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === product.id ? (
                        <TextField
                          name="bitola"
                          value={editForm.bitola}
                          onChange={handleEditChange}
                          variant="filled"
                          className="produtos-table-input"
                          size="small"
                        />
                      ) : (
                        product.bitola
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === product.id ? (
                        <TextField
                          name="comprimento"
                          value={editForm.comprimento}
                          onChange={handleEditChange}
                          variant="filled"
                          className="produtos-table-input"
                          size="small"
                        />
                      ) : (
                        product.comprimento
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === product.id ? (
                        <TextField
                          name="preco"
                          value={editForm.preco}
                          onChange={handleEditChange}
                          variant="filled"
                          className="produtos-table-input"
                          size="small"
                          type="number"
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      ) : (
                        `R$ ${Number(product.preco).toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === product.id ? (
                        <TextField
                          name="quantidade"
                          value={editForm.quantidade}
                          onChange={handleEditChange}
                          variant="filled"
                          className="produtos-table-input"
                          size="small"
                          type="number"
                          inputProps={{ min: 0, step: 1 }}
                        />
                      ) : (
                        product.quantidade
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {editingId === product.id ? (
                        <>
                          <IconButton color="success" onClick={() => handleSave(product.id)}><SaveIcon /></IconButton>
                          <IconButton color="error" onClick={handleCancel}><CancelIcon /></IconButton>
                        </>
                      ) : (
                        <IconButton color="primary" onClick={() => handleEdit(product)}><EditIcon /></IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </div>
    </div>
  );
};

export default Produtos;
