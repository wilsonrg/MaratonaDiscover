//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
/*================================================================================================*
 *=======================================TRATATIVAS DO MODAL======================================*
 *================================================================================================*/
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

// DECLARAÇÕES DE VARIÁVEIS
const modalOverlay = document.querySelector('.modal-overlay')
const ModalButtonCancel = document.querySelector('.modal-overlay .button.cancel')
const buttonNew = document.querySelector('.button.new')
const Modal = {
	far() { // função add() + remove()
		modalOverlay.classList.toggle('active')
	}
}
// AÇÕES
buttonNew.addEventListener('click', () => Modal.far())
ModalButtonCancel.addEventListener('click', () => Modal.far())

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
/*================================================================================================*
 *===========================================FORMULÁRIO===========================================*
 *================================================================================================*/
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

/*================================================================================================*
 *==============================GUARDANDO AS INFORMAÇÕES NO NAVEGADOR=============================*
 *================================================================================================*/
const Storage = {
	get() {
		return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
	},
	set(transactions) {
		localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
	}
}
// DECLARAÇÕES DE VARIÁVEIS COM FUNÇÕES
const FormatValue = { // Formata para Moeda
	formatAmount(value) {
		value = Number(value.replace(/\,\./g, '')) * 100
		return value
	},
	formatCurrency(value) {
		const signal = Number(value) < 0 ? "-" : ""
		value = String(value).replace(/\D/g, "")
		value = Number(value) / 100
		value = value.toLocaleString("pt-BR", {
			style: "currency",
			currency: "BRL"
		})
		return signal + value
	},
	formatDate(value) {
		const dt = value.split("-")
		return `${dt[2]}/${dt[1]}/${dt[0]}`
	}
}
const Transaction = {
	all: Storage.get()
	/*
	[
		{ // Informações exibidas na Table
			description: 'Luz',
			amount: -50000,
			date: '23/01/2021'
		}, {
			description: 'Criação de Website',
			amount: 500000,
			date: '23/01/2021'
		}, {
			description: 'Internet',
			amount: -20000,
			date: '23/01/2021'
		}
	]
	*/
	,
	add(transaction) {
		Transaction.all.push(transaction);
		App.reload()
	},
	remove(index) {
		Transaction.all.splice(index, 1)
		App.reload()
	},
	incomes() { // somar as entradas
		let income = 0
		Transaction.all.forEach(transaction => {
			if (transaction.amount > 0)
				income += transaction.amount
		})
		return income
	},
	expenses() { // somar as saídas
		let expense = 0
		Transaction.all.forEach(transaction => {
			if (transaction.amount < 0)
				expense += transaction.amount
		})
		return expense
	},
	total() { // total  = entradas - saídas
		return Transaction.incomes() + Transaction.expenses()
	}
}
const DOM = {
	transactionsContainer: document.querySelector('#data-table tbody'),
	addTransaction(transaction, index) { // Adiciona itens na Table
		const tr = document.createElement('tr')
		tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
		tr.dataset.index = index
		DOM.transactionsContainer.appendChild(tr)
	},
	innerHTMLTransaction(transaction, index) { // Gera a Table
		const CSSclass = transaction.amount > 0 ? "income" : "expense"
		const amount = FormatValue.formatCurrency(transaction.amount)
		const html = `
			<td class="description">${transaction.description}</td>
			<td class="${CSSclass}">${amount}</td>
			<td class="date">${transaction.date}</td>
			<td><img src="./assets/minus.svg" onclick="Transaction.remove(${index})" class="mao" alt="Remover transação"></td>
		`
		return html
	},
	updateBalance() { // exibe a somatória dos valores totais
		document.querySelector('#incomeDisplay').innerHTML = FormatValue.formatCurrency(Transaction.incomes())
		document.querySelector('#expenseDisplay').innerHTML = FormatValue.formatCurrency(Transaction.expenses())
		document.querySelector('#totalDisplay').innerHTML = FormatValue.formatCurrency(Transaction.total())
	},
	clearTransactions() {
		DOM.transactionsContainer.innerHTML = ""
	}
}
const Form = {
	description: document.querySelector('#description'),
	amount: document.querySelector('#amount'),
	date: document.querySelector('#date'),
	getValues() {
		return {
			description: Form.description.value,
			amount: Form.amount.value,
			date: Form.date.value
		}
	},
	validateFields() {
		const { description, amount, date } = Form.getValues()
		if (description.trim() === '' || amount.trim() === '' || date.trim() === '')
			throw new Error('preencha todos os campos')
	},
	formatValues() {
		let { description, amount, date } = Form.getValues()
		amount = FormatValue.formatAmount(amount)
		date = FormatValue.formatDate(date)
		return {
			description,
			amount,
			date
		}
	},
	clearFields() {
		Form.description.value = ''
		Form.amount.value = ''
		Form.date.value = ''
	},
	submit(event) {
		event.preventDefault()
		try {
			Form.validateFields()
			const transaction = Form.formatValues()
			Transaction.add(transaction)
			Form.clearFields()
			Modal.far()
		} catch (error) {
			alert(error.message)
		}

	}
}

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
/*================================================================================================*
 *=======================================Executa a Aplicação======================================*
 *================================================================================================*/
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
const App = {
	init() {
		Transaction.all.forEach(DOM.addTransaction);
		DOM.updateBalance()
		Storage.set(Transaction.all)
	},
	reload() {
		DOM.clearTransactions()
		App.init()
	}
}
App.init();
