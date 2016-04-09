#HR, 04-27-15
#Orphan Black Analysis
#Look at character time by episode, cloneswap times, etc

library("dplyr")
library("tidyr")
library("jsonlite")

ob <- read.csv("data/obtimes.csv", header=T, stringsAsFactors=F)
totaltime <- read.csv("data/totaltime.csv", header=T, stringsAsFactors=F)

#Add a cloneswap variable
ob <- ob %>% mutate(cloneswap = ifelse(character != charas, 1, 0))
write.csv(ob, "data/obtimes.csv", row.names=F, na="")

objs <- ob %>% select(episode, startmin, stopmin, character, charas, cloneswap)
objson <- toJSON(objs, digits=6)
write(objson, "data/obtimes.json")

#Collapse to get minutes by character & episode
timebyep <- ob %>% group_by(episode, character) %>%
  summarize(minutes = sum(tottime)/60)
temp <- ob %>% group_by(episode) %>%
  summarize(minutes = sum(tottime)/60) %>% 
  mutate(character = "All Tatiana Maslany Clones")
timebyep <- rbind(timebyep, temp)
rm(temp)

write.csv(timebyep, file="data/chartimebyep.csv", row.names=F, na="")

#Data for table: total time by character, # of episodes, cloneswaps
chartable <- timebyep %>% mutate(p = 1) %>%
  group_by(character) %>%
  summarize(episodesin = sum(p),
          minutes = sum(minutes)) %>%
  arrange(desc(minutes)) %>%
  mutate(cloneswaps = ifelse(character=="Sarah", "Beth, Katja, Alison, Cosima, Rachel",
                  ifelse(character=="Alison" | character=="Rachel", "Sarah",
                         ifelse(character=="Cosima", "Alison",
                                ifelse(character=="Helena", "Sarah as Beth, Sarah, Alison", ""              
                                )))))

#Get total screen time by clone & cloneswap
cloneswap <- ob %>% group_by(character, charas) %>%
  summarize(minutes = sum(tottime)/60) %>%
  filter(character != charas)

write.csv(chartable, file="data/charactertable.csv", row.names=FALSE)

sum(totaltime$epmin)
sum(totaltime$tmasmin)


