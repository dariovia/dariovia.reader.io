function loadConfiguration(conf) {
	switch (conf) {
		case 'data':
			confHash = {
				compiti: "https://dariovia.github.io/dariovia.reader.io/reader/csv/data.csv",
				spesa: "https://dariovia.github.io/dariovia.reader.io/reader/csv/spesa.csv",
				altro: "https://dariovia.github.io/dariovia.reader.io/reader/csv/altro.csv",
				chimica: "https://dariovia.github.io/dariovia.reader.io/reader/csv/chimica.csv",
				latino: "https://dariovia.github.io/dariovia.reader.io/reader/csv/latino.csv"
			}
			break;
		default:
			confHash = {}
	}
	return confHash
}

