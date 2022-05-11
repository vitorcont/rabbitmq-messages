const shelfTable = require("./table");

const treatRoute = async ({ endpoint, method, body, params, query }) => {
	switch (method) {
		case "GET":
			if (params.id) {
				return shelfTable.find(params.id);
			}
			return shelfTable.list({ raw: true });
		case "PUT":
			// const package = await shelfTable.find(params.id);
			// if (!package) {
			// 	return new Error();
			// }
			if (endpoint.includes("/purchase")) {
				return {
					FOI: "Compra",
				};
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
