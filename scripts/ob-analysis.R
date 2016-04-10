#HR, 04-27-15
#Orphan Black Analysis
#Look at character time by episode, cloneswap times, etc

library("dplyr")
library("tidyr")
library("jsonlite")

ob <- read.csv("data/obtimes.csv", header=T, stringsAsFactors=F)
totaltime <- read.csv("data/totaltime.csv", header=T, stringsAsFactors=F)
charmeta <- read.csv("data/charactermeta.csv", header=T, stringsAsFactors=F)

#Add a cloneswap variable and minutes
ob <- ob %>% mutate(cloneswap = ifelse(character != charas, 1, 0)) %>%
  mutate(minutes = tottime/60)
write.csv(ob, "data/obtimes.csv", row.names=F, na="")

objs <- ob %>% select(episode, startmin, stopmin, character, charas, cloneswap)
objson <- toJSON(objs, digits=6)
write(objson, "data/obtimes.json")

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
chartable <- timebyep %>% mutate(p = 1) %>%
  group_by(character) %>%
  summarize(episodesin = sum(p),
          minutes = sum(minutes)) %>%
  arrange(desc(minutes)) 
chartable <- left_join(charmeta, chartable, by="character")
write.csv(chartable, file="data/charactertable.csv", row.names=FALSE)

#Get total screen time by clone & cloneswap
cloneswap <- ob %>% group_by(character, charas) %>%
  summarize(minutes = sum(minutes)) %>%
  filter(character != charas)

sum(totaltime$epmin)
sum(totaltime$tmasmin)


