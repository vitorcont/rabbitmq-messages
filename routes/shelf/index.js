const shelfTable = require("./table");
const transferTable = require("../transfer/table");
const stockTable = require("../stock/table");

let id = "";
let newStockAmount = -1;
let newShelfAmount = -1;


const purchase = async ({ endpoint, method, body, params, query }) => {
	if (body.id === id && newShelfAmount === body.newShelfAmount) {
		return new Error("500");
	}
	id = body.id;
	newShelfAmount = body.newShelfAmount;
	let package = await shelfTable.find(body.id);
	if (!package) {
		return new Error("Não foi possível encontrar esse produto");
	}

	if (package.amount - body.amount < 0) {
		return new Error("QUantidade Inválida");
	}

	let shelfProduct = {
		amount: body.newShelfAmount,
	};
	await shelfTable.update(body.id, shelfProduct);
	package = {
		...package,
		amount: body.newShelfAmount,
	};

	delete package.id;
	return transferTable.create({
		...package,
		code: package.code,
		amount: body.amount,
		type: 2,
		newShelfAmount: body.newShelfAmount,
		newStockAmount: 0,
		interactionDate: new Date().toISOString(),
		interactionMillis: new Date().getTime(),
	});
};

const withdrawal = async ({ endpoint, method, body, params, query }) => {
	if (body.id === id && newStockAmount === body.newStockAmount) {
		return new Error();
	}
	id = body.id;
	newStockAmount = body.newStockAmount;
	
	let package = await stockTable.find(body.id);
	if (!package) {
		return new Error();
	}
	if (package.amount - body.amount < 0) {
		return new Error();
	}
	let shelfProduct = await shelfTable.find(body.id);
	if (!!shelfProduct) {
		shelfProduct = {
			amount: body.newShelfAmount,
		};
		await shelfTable.update(body.id, shelfProduct);
	} else {
		await shelfTable.create({
			...package,
			amount: body.amount,
		});
	}

	await stockTable.update(body.id, {
		...package,
		amount: body.newStockAmount,
	});

	delete package.id;
	return transferTable.create({
		...package,
		code: package.code,
		amount: body.amount,
		type: 1,
		newShelfAmount: body.newShelfAmount,
		newStockAmount: body.newStockAmount,
		interactionDate: new Date().toISOString(),
		interactionMillis: new Date().getTime(),
	});
};

const treatRoute = async ({ endpoint, method, body, params, query }) => {
	switch (method) {
		case "GET":
			if (params.id) {
				return shelfTable.find(params.id);
			}
			return shelfTable.list({ raw: true });
		case "PUT":
			console.log("aqui", endpoint, query, params, endpoint.includes("/purchase"));
			if (endpoint.includes("/purchase")) {
				return purchase({ endpoint, method, body, params, query });
			}
			return withdrawal({ endpoint, method, body, params, query });
		default:
			return;
	}
};

module.exports = treatRoute;
