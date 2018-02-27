library('jsonlite')

raw_data <- fromJSON("~/github/CS4802/DataVisFinal/data/buffer/raw_json/movies_metadata.json")
data <- fromJSON("~/github/CS4802/DataVisFinal/data/buffer/filteredData.json")
data$release_date = as.Date(data$release_date, "%Y-%m-%d")

# Number of movies with a budget
sum(data$budget != 0)

# Year Frequencies
hist(data$release_date, breaks="years", freq=TRUE)

# Decades
hist(data$release_date, as.Date(c('1850-1-1', '1950-1-1', '1960-1-1', 
                                  '1970-1-1', '1980-1-1', '1990-1-1', 
                                  '2000-1-1', '2010-1-1', '2020-1-1')), freq=TRUE)

# 1st Bin
bin1 <- data[data$release_date > as.Date('1850-1-1') & data$release_date < as.Date('1950-1-1'),]

# Top 3 Keywords of 1st Bin (Raw Frequency)
bin1Freq <- as.data.frame((table(unlist(bin1$keywords))))
topBin1 <- bin1Freq[order(-bin1Freq$Freq), ][1:3, ]


# Top 500 of 1st Bin
topBin1 <- bin1[order(0 - as.numeric(bin1$vote_average)*as.numeric(bin1$vote_count)), ][1:500, ]

# Top 500 Movies of "all time" as a function of "popularity"
sortedData <- data[order(0 - as.numeric(data$vote_average)*as.numeric(data$vote_count)), ][1:500, ]
