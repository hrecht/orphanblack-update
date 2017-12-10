# Orphan Black Analysis
# Format data files for visualization
# Look at character time by episode, cloneswap times, etc

library("readxl")
library("dplyr")
library("tidyr")

# Main data: 1 row per character appearance
ob <- read.csv("data/original/obtimes.csv", header=T, stringsAsFactors=F)
# Episode data - length, screen time, percent
totaltime <- read.csv("data/totaltime.csv", header=T, stringsAsFactors=F)
# Character metadata - origin, status, etc
charmeta <- read.csv("data/original/charactermeta.csv", header=T, stringsAsFactors=F)
# Episode titles
titles <- read_excel("data/original/obs5.xlsx", sheet="titles")

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

newep <- read_excel("data/original/obs5.xlsx", sheet="ep50")
newep <- formatEpisode(newep)
newrow <- makeEpisodeRow(newep)
# If the end of the episode is clone-less remove that row
newep <- newep %>% filter(character != "END")

ob <- rbind(ob, newep)
ob <- ob %>% arrange(episode, startsec)
write.csv(ob, "data/original/obtimes.csv", row.names=F, na="")

# Minimal for graphic
ob_min <- ob %>% select(episode, character, startmin, stopmin)
write.csv(ob_min, "data/obtimes.csv", row.names=F, na="")

totaltime <- rbind(totaltime, newrow)
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
timebyep <- bind_rows(timebyep, temp)
rm(temp)

write.csv(timebyep, file="data/original/chartimebyep.csv", row.names=F, na="")

#Data for table: total time by character, # of episodes, cloneswaps
chartable <- timebyep %>% group_by(character) %>%
  summarize(episodesin = n(),
          minutes = sum(minutes))

chartable <- left_join(charmeta, chartable, by="character")
chartable <- chartable %>% arrange(desc(minutes)) 

write.csv(chartable, file="data/charactertable.csv", row.names=F, na="")

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

# Time by season
timebyseason <- ob %>% mutate(season = ifelse(episode <=10, 1,
                                              ifelse(episode <= 20, 2,
                                                     ifelse(episode<=30, 3,
                                                            ifelse(episode<=40, 4,
                                                                   5))))) %>%
  group_by(season, character) %>%
  summarize(minutes = sum(minutes)) %>%
  arrange(season, desc(minutes))

# Characters by episode
charbyep <- timebyep %>% filter(character != "All Tatiana Maslany Clones") %>%
  group_by(episode) %>%
  summarize(clones = n())
table(charbyep$clones)

timebyep2 <- timebyep %>% filter(character != "All Tatiana Maslany Clones")

library(ggplot2)
seasons <- ggplot(timebyseason, aes(x = desc(season), y = minutes, group = character, fill = character)) +
  geom_bar(stat = "identity") +
  coord_flip()
seasons

episodes <- ggplot(timebyep2, aes(x = episode, y = minutes, group = character, fill = character)) +
  geom_bar(stat = "identity")
episodes

mainchar <- chartable %>% filter(character!= "All Tatiana Maslany Clones" & minutes > 1)
bars <- ggplot(mainchar, aes(x = character, y = minutes)) +
  geom_bar(stat = "identity")
bars
