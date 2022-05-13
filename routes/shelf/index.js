const shelfTable = require("./table");
const transferTable = require("../transfer/table");

const purchase = async ({ endpoint, method, body, params, query }) => {
	let package = await stockTable.find(body.id);
	const delta = package.amount - body.amount;
	if (delta < 0) {
		return new Error();
	}
	package = {
		...package,
		amount: delta,
	};
	let shelfProduct = await shelfTable.find(body.id);
	if (!!shelfProduct) {
		shelfProduct = {
			...shelfProduct,
			amount: shelfProduct.amount + body.amount,
		};
		await shelfTable.update(body.id, shelfProduct);
	} else {
		await shelfTable.create({
			...package,
			amount: body.amount,
		});
	}

	const updatedPackage = await stockTable.update(id, package);
	if (!updatedPackage === 0) {
		return new Error();
	}

	delete package.id;
	return transferTable.create({
		...package,
		code: id,
		amount: body.amount,
		type: 1,
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
			if (endpoint.includes("/purchase")) {
				return purchase();
			}
			return {
				FOI: "Retirada",
			};
		// return shelfTable.update(params.id, body);
		default:
			return;
	}
};

module.exports = treatRoute;
