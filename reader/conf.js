function loadConfiguration(conf) {
	switch (conf) {
		case 'data':
			confHash = {
				compiti: "https://dariovia.github.io/dariovia.reader.io/reader/csv/data.csv",
				spesa: "https://dariovia.github.io/dariovia.reader.io/reader/csv/spesa.csv",
				altro: "https://dariovia.github.io/dariovia.reader.io/reader/csv/altro.csv",
				chimica: "https://dariovia.github.io/dariovia.reader.io/reader/csv/chimica.csv",
				latino: "https://dariovia.github.io/dariovia.reader.io/reader/csv/latino.csv",
				verbi: "https://dariovia.github.io/dariovia.reader.io/reader/csv/verbi.csv",
				verbi2: "https://dariovia.github.io/dariovia.reader.io/reader/csv/20250215/verbi.csv"
			}
			break;
		default:
			confHash = {}
	}
	return confHash
}

