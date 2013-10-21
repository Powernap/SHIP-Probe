(function(exports){
(function(exports){
probe = {version: "0.0.1"}; // semver
probe.loadCSVFile = function(csvFilePath, categoriesFilePath, callback) {
	d3.csv(csvFilePath, function(csvContent) {
		d3.json(categoriesFilePath, function(description) {
			// Create Array of all Dimensions with necessary Information
			// We use the first Element of the CSV File to gather the information
			var data = new Object();
			for (key in csvContent[0]) {
				element = new Object();
				element.name = key;
				element.description = description[key];
				element.data = new Array(); // here all values will be stored
				data[key] = element;
			}
			// No we have to collect the values and attach them to the data set
			for (var i = 0; i < csvContent.length; i++) { // Parse each element of the CSV file
				var currentElement = csvContent[i];
				for (key in data) { // parse all data dimensions
					var currentValue = currentElement[data[key].name];
					if (data[key].description.scale == 'rational')
						data[key].data.push(parseFloat(currentValue.replace(",", ".")));
					else
						data[key].data.push(currentValue);
				}
			}
			callback(data);
		});
	});
}

probe.exportAsCSV = function(data, removeInvalidData, invalidEntryPlaceholder) {
	var dataArray = undefined;
	if (removeInvalidData == true)
		dataArray = d3.values(removeFaultyData(data));
	else
		dataArray = d3.values(data);
	if (invalidEntryPlaceholder == undefined) // Default Placeholder
		invalidEntryPlaceholder = '?';

	var content = '';
	// Calculate first line
	for (var i = 0; i < dataArray.length; i++){
		content += dataArray[i].description.name.split(',').join('.');
		if (i == dataArray.length - 1) // last element, end with newline
			content += '\n';
		else
			content += ',';
	}
	// Add the rest of the file
	for (var currentElement in dataArray[0].data) { // new line for each subject
		for (var key in dataArray) {
			var currentValue = dataArray[key].data[currentElement].toString().split(',').join('.'); // add i'th element of j'th variable
			if (removeInvalidData == false)
				content += currentValue;
			else if (currentValue != '9 - noData' && parseFloat(currentValue) < 900 && currentValue.toString() != 'NaN')
				content += currentValue;
			else
				content += invalidEntryPlaceholder;
			if (key == dataArray.length - 1 && currentElement != dataArray[0].length - 1)
				content += '\n';
			else
				content += ',';
		}
	}

	return content;
}

function removeFaultyData(data) {
	// Clone Object
	var dataCopy = (JSON.parse(JSON.stringify(data))); // Note: This overwrites NaN-Values with Null!
	for (key in dataCopy) {
		var currentElement = dataCopy[key];
		currentElement.invalidIndices = new Array();
		for (var j = 0; j < currentElement.data.length; j++) {
			var currentValue = currentElement.data[j];
			if (currentValue == null) { // to fix NaNs
				currentValue = NaN;
				currentElement.data[j] = NaN;
			}
			if (currentValue == '9 - noData' || parseFloat(currentValue) > 900 || currentValue.toString() == 'NaN')
				currentElement.invalidIndices[j] = true;
		}
	}
	return dataCopy;
}

})(this);
})(this);