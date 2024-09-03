import { GithubUser } from "./GithubUser.js"

// classe que irá conter a lógica dos dados
export class Favorites {
  constructor(root) {
    /* o 'root' do constructor será a div 'app'*/
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  // Lógica para manter itens salvos mesmo depois de atualizar a página
  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {

      const userExists = this.entries.find(entry => entry.login === username)

      if(userExists) {
        throw new Error('Usuário já cadastrado!')
      }

      const user = await GithubUser.search(username)

      if(user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch(error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

      this.entries = filteredEntries
      this.update()
      this.save()
  }
}

// classe que irá criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody') 

    this.update()
    this.onadd()
  }

  // Criando a lógica para adição de perfis Github na aplicação
  onadd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)

      // Limpar o campo 'input' após adicionar usuário
      this.root.querySelector('.search input').value = ''
    }
  }

  update() {
    this.removeAllTr()

    // Caso não haja perfis favoritados, executar a função 'createEmptyRow'
    if(this.entries.length == 0) {
      this.tbody.append(this.createEmptyRow())
    }

    this.entries.forEach( user => {
      const row = this.createRow()

      /* Alterando dinamicamente os dados de cada usuário
      inserido na aplicação */
      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      /* Lógica para deletar um usuário a partir do
      clique no botão 'remover' */
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')
        if(isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }
  
  // Criando linhas dinâmicas
  createRow() {
    // Usando a DOM para criar o elemento 'tr'
    const tr = document.createElement('tr')
    tr.innerHTML = `
        <td class="user">
          <img src="https://github.com/BernardoSa01.png" alt="Imagem de Bernardo Sá">
          <a href="https://github.com/BernardoSa01" target="_blank">
            <p>Bernardo Sá</p>
            <span>BernardoSa01</span>
          </a>
        </td>
        <td class="repositories">
          25
        </td>
        <td class="followers">
          2
        </td>
        <td>
          <button class="remove">Remover</button>
        </td>
    `
    return tr
  }

  createEmptyRow() {
    const tr = document.createElement('tr')
    tr.classList.add('noFavorites')

    tr.innerHTML = `
          <td colspan="4">
            <div>
              <img src="./assets/Star-zeroFav.svg">
              <p>Nenhum favorito ainda</p>
            </div>
          </td>
        `
    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach((tr) => {
        tr.remove()
      })
  }
}
