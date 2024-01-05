function loadConfiguration(conf) {
	switch (conf) {
		case 'data':
			confHash = {
				compiti: "https://dariovia.github.io/dariovia.reader.io/reader/csv/data.csv",
				spesa: "https://dariovia.github.io/dariovia.reader.io/reader/csv/spesa.csv",
				altro: "https://dariovia.github.io/dariovia.reader.io/reader/csv/altro.csv"
			}
			break;
		default:
			confHash = {}
	}
	return confHash
}

