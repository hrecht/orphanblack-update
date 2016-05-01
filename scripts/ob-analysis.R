# Orphan Black Analysis
# Format data files for visualization
# Look at character time by episode, cloneswap times, etc

library("readxl")
library("dplyr")
library("tidyr")
library("jsonlite")

# Main data: 1 row per character appearance
ob <- read.csv("data/obtimes.csv", header=T, stringsAsFactors=F)
# Episode data - length, screen time, percent
totaltime <- read.csv("data/totaltime.csv", header=T, stringsAsFactors=F)
# Character metadata - origin, status, etc
charmeta <- read.csv("data/charactermeta.csv", header=T, stringsAsFactors=F)
# Episode titles
titles <- read_excel("data/obs4.xlsx", sheet="titles")

########################################################################################################
# Format episode-level character time data
########################################################################################################

formatEpisode <- function(dt) {
  # Remove the separate minutes and seconds columns used for recording times, just keep # of seconds
  dt <- dt %>% select(-startm_raw, -starts_raw, -stopm_raw, -stops_raw)
  # Go from raw time to episode time - removing recap & credits
  # Remove RECAP length from starttime and stoptime
  recap <- dt$tottime[dt$character=="RECAP"]
  dt <- dt %>% mutate(startsec = starttime_raw - recap,
                      stopsec = stoptime_raw - recap) %>%
    filter(character != "RECAP")
  
  # Remove CREDITS length from all rows after credits
  credits <- dt$tottime[dt$character=="CREDITS"]
  credits_row <- which(dt$character == "CREDITS")
  
  dt <- dt %>% mutate(startsec = ifelse(row_number(episode) < credits_row, startsec,
                                        startsec - credits),
                      stopsec = ifelse(row_number(episode) < credits_row, stopsec,
                                       stopsec - credits)) %>%
    filter(character != "CREDITS")
  
  # Add minutes columns and cloneswap binary variable
  dt <- dt %>% mutate(startmin = startsec/60,
                      stopmin = stopsec/60,
                      minutes = (stopsec - startsec)/60) %>%
    select(-starttime_raw, -stoptime_raw) %>% 
    mutate(cloneswap = ifelse(character != charas, 1, 0))
}

########################################################################################################
# Add to total time table
########################################################################################################

# Get total time and tmas time from episode, join to title
makeEpisodeRow <- function(dt) {
  # Usually the episode length is the maximum stoptime value
  # Occasionally the episode ends without a Maslany character - recorded as "END"
  epend <- max(dt$stopsec)
  dt <- dt %>% filter(character != "END")
  eprow <- dt %>% group_by(episode) %>%
    summarize(tattime = sum(tottime)) %>%
    mutate(eptime = epend, 
           epmin = eptime/60,
           tmasmin = tattime/60,
           tmaspct = tattime/eptime)
  # Add title to row
  eprow <- left_join(eprow, titles, by="episode")
}

########################################################################################################
# Add new episodes to full series dataset, total time dataset
########################################################################################################

ep31 <- read_excel("data/obs4.xlsx", sheet="ep31")
ep31 <- formatEpisode(ep31)
row31 <- makeEpisodeRow(ep31)

ep33 <- read_excel("data/obs4.xlsx", sheet="ep33")
ep33 <- formatEpisode(ep33)
row33 <- makeEpisodeRow(ep33)

ob <- rbind(ob, ep31)
ob <- ob %>% arrange(episode, startsec)
write.csv(ob, "data/obtimes.csv", row.names=F, na="")

totaltime <- rbind(totaltime, row31)
totaltime <- totaltime %>% arrange(episode)
write.csv(totaltime, "data/totaltime.csv", row.names=F, na="")

########################################################################################################
# Make character-level data files
########################################################################################################

#Collapse to get minutes by character & episode
timebyep <- ob %>% group_by(episode, character) %>%
  summarize(minutes = sum(minutes))
temp <- ob %>% group_by(episode) %>%
  summarize(minutes = sum(minutes)) %>% 
  mutate(character = "All Tatiana Maslany Clones")
timebyep <- rbind(timebyep, temp)
rm(temp)

write.csv(timebyep, file="data/chartimebyep.csv", row.names=F, na="")

#Data for table: total time by character, # of episodes, cloneswaps
chartable <- timebyep %>% group_by(character) %>%
  summarize(episodesin = n(),
          minutes = sum(minutes))

chartable <- left_join(charmeta, chartable, by="character")
chartable <- chartable %>% arrange(desc(minutes)) 

write.csv(chartable, file="data/charactertable.csv", row.names=FALSE)

########################################################################################################
# Miscellaneous data
########################################################################################################

#Get total screen time by clone & cloneswap
cloneswap <- ob %>% group_by(character, charas) %>%
  summarize(minutes = sum(minutes)) %>%
  filter(character != charas)

# Headline numbers for clone tracker
sum(totaltime$epmin)
sum(totaltime$tmasmin)