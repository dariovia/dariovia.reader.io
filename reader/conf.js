function loadConfiguration(conf) {
	switch (conf) {
		case 'data':
			confHash = {
				compiti: "https://dariovia.github.io/dariovia.reader.io/reader/csv/data.csv",
				altro: "https://dariovia.github.io/dariovia.reader.io/reader/csv/altro.csv"
			}
			break;
		default:
			confHash = {}
	}
	return confHash
}

