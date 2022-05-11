const stockRoutes = require("./stock");
const shelfRoutes = require("./shelf");
const transferRoutes = require("./transfer");

const router = ({ endpoint, method, body, params, query }) => {
	if (endpoint.includes("/shelf")) {
		return shelfRoutes({ endpoint, method, body, params, query });
	} else if (endpoint.includes("/stock")) {
		return stockRoutes({ endpoint, method, body, params, query });
	} else if (endpoint.includes("/transfer")) {
		return transferRoutes({ endpoint, method, body, params, query });
	}
};

module.exports = router;
