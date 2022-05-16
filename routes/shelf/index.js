const shelfTable = require("./table");
const transferTable = require("../transfer/table");
const stockTable = require("../stock/table");

const purchase = async ({ endpoint, method, body, params, query }) => {
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

	const stock = await stockTable.find(body.id);

	delete package.id;
	return transferTable.create({
		...package,
		code: package.code,
		amount: body.amount,
		type: 2,
		newShelfAmount: body.newShelfAmount,
		newStockAmount: stock.amount,
		interactionDate: new Date().toISOString(),
		interactionMillis: new Date().getTime(),
	});
};

const withdrawal = async ({ endpoint, method, body, params, query }) => {
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
