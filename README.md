# estoquePlan
Esse projeto é uma versão de controle de estoque, pensada para ser fácil, rápida e simples de gerenciar.

# Observacoes
Sempre que utilizar a ferramenta, você deve verificar qual tipo de dados o endpoint espera, olhando o controlador da aplicação. Quando você vê o uso da notação @RequestBody, significa que ele espera que os dados venham no corpo da requisição, e JSON é o formato mais comum para APIs REST.

Exemplo disso, atualmente é o ClienteController:
@PostMapping
    public ResponseEntity<Cliente> criarCliente(@RequestBody Cliente cliente) {
        Cliente novoCliente = clienteService.salvar(cliente);
        return ResponseEntity.ok(novoCliente);
}

Analisando a entidade Cliente, você deveria enviar um POST no endpoint em questão, com um JSON do tipo:

{
    "nome": "Cliente Teste",
    "email": "primeirocliente@email.com",
    "telefone": "123456789",
    "endereco": "Rua Teste, 123"
}

