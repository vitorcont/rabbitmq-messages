const transferTable = require("./table");

const treatRoute = async ({ endpoint, method, body, params, query }) => {
	switch (method) {
		case "GET":
			if (query.type !== undefined && query.initialDate === undefined) {
				return transferTable.findType(query.type);
			} else if (
				query.initialDate !== undefined &&
				query.endDate !== undefined
			) {
				return transferTable.findPeriod(
					new Date(query.initialDate).getTime(),
					new Date(query.endDate).getTime(),
					query.type,
				);
			}
			return transferTable.list();
		case "POST":
			return transferTable.create(body);
		case "PUT":
			let package;
			package = await transferTable.find(params.id);
			if (!package) {
				return new Error();
			}
			return transferTable.update(params.id, body);
		case "DELETE":
			return transferTable.remove(params.id);
		default:
			return;
	}
};

module.exports = treatRoute;
