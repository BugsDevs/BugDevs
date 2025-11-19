const bcrypt = require('bcrypt');



module.exports = {
  up: async (queryInterface) => {
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedClientPassword = await bcrypt.hash('cliente123', 10);

    await queryInterface.bulkInsert('clientes', [
      {
        nome: 'Admin SmoothLife',
        email: 'admin@smoothlife.com',
        senha: hashedAdminPassword,
        tipo_usuario: 'admin',
        telefone: '(11) 98765-4321',
        rua: 'Rua Admin',
        numero: '100',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        data_cadastro: new Date(),
        cpf: '123.456.789-00'
      },
      {
        nome: 'Cliente Teste',
        email: 'cliente@teste.com',
        senha: hashedClientPassword,
        tipo_usuario: 'cliente',
        telefone: '(11) 91234-5678',
        rua: 'Rua Cliente',
        numero: '200',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        cep: '12345-678',
        data_cadastro: new Date(),
        cpf: '987.654.321-00'
      }
    ], {});

    await queryInterface.bulkInsert('produtos', [
      {
        nome_produto: 'Detox Verde',
        descricao: 'Smoothie de espinafre, maçã, abacaxi e gengibre',
        preco: 15.90,
        estoque: 50,
        disponivel: true,
        imagem_url: '../imgprodutos/detox_verde.jpg',
        criado_em: new Date()
      },
      {
        nome_produto: 'Tropical Energy',
        descricao: 'Smoothie de manga, maracujá e água de coco',
        preco: 18.50,
        estoque: 30,
        disponivel: true,
        imagem_url: '../imgprodutos/tropical_energy.jpg',
        criado_em: new Date()
      }
    ], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('produtos', null, {});
    await queryInterface.bulkDelete('clientes', null, {});
  }
};

