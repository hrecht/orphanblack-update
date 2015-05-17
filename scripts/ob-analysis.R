#HR, 04-27-15
#Orphan Black Analysis: Season 3
#Look at character time by episode, cloneswap times, etc
#Quick small multiple barcharts of time per episode by clone

require(doBy)
require(dplyr)
require(tidyr)

require(ggplot2)
require(extrafont)
require(scales)

ob<-read.csv("data/obtimes.csv",header=T, stringsAsFactors=F)
totaltime<-read.csv("data/totaltime.csv",header=T, stringsAsFactors=F)

#Add a cloneswap variable
ob<-mutate(ob, cloneswap = 0 %>%
             ifelse(character != charas, 1,.))

#Collapse by episode and character
ctimebyep <- summaryBy(tottime ~ episode + character, FUN=c(sum), data=ob)

tattime <- summaryBy(tottime ~ episode, FUN=c(sum), data=ob)
tattime$character <- c("All Tatiana Maslany Clones")
ctimebyep <- rbind(ctimebyep,tattime)
ctimebyep <- rename(ctimebyep, seconds = tottime.sum)
ctimebyep$minutes = ctimebyep$seconds/60

write.csv(ctimebyep, file="data/chartimebyep.csv", row.names=FALSE)

#Data for table: total time by character, # of episodes, cloneswaps
ctimebyep<-mutate(ctimebyep, p = 1)
chartime <- summaryBy(minutes + p ~ character, FUN=c(sum), data=ctimebyep)
chartime <- rename(chartime, totalminutes = minutes.sum, episodesin = p.sum)
chartime <- arrange(chartime, desc(totalminutes))
chartime<-mutate(chartime, cloneswaps = 
                   ifelse(character=="Sarah", "Beth, Katja, Alison, Cosima, Rachel",
                          ifelse(character=="Alison" | character=="Rachel", "Sarah",
                                 ifelse(character=="Helena", "Sarah as Beth, Sarah", ""              
                    ))))
write.csv(chartime, file="data/charactertable.csv", row.names=FALSE)

#Get total screen time by clone & cloneswap
cloneswap <- summaryBy(tottime ~ character + charas, FUN=c(sum), data=ob)
cloneswap$totmin = cloneswap$tottime/60

#Subset the main five + total
mainchars<-filter(ctimebyep,grepl("Sarah|Alison|Cosima|Helena|Rachel|All Tatiana Maslany Clones", character))

#Small multiple barcharts of the main 5 + all clones episode times - just for a quick look (~unformatted)
barcharts<-ggplot(mainchars, aes(x = factor(episode), y = minutes)) + 
  geom_bar(stat = "identity") + 
  facet_wrap(~ character) + 
  scale_y_continuous(breaks=seq(0, 55, 10)) + 
  theme(panel.grid.minor=element_blank(), 
        panel.grid.major.x=element_blank(),
        legend.position="none",
        axis.title=element_text(size=12,family="Arial",face="bold"),
        axis.text = element_text(size=6, family="Arial", color="#444444"),
        plot.title = element_text(size=16, family="Arial")) + 
  ylab("Minutes") + 
  xlab("Episode") + 
  ggtitle("Character Time by Episode")
barcharts

png(filename = "offline/charts/barcharts_25ep.png", width=1800, height=1000, res=200)
barcharts
dev.off()

#Line chart of % tmas by episode
linechart <- ggplot(totaltime, aes(x=episode, y=tmaspct, group=1)) +
  geom_line() +
  geom_point() +
  scale_y_continuous(limits=c(0,1.3), breaks=seq(0,1.3,0.1), labels=percent) +
  theme(panel.grid.minor=element_blank(), 
        panel.grid.major.x=element_blank(),
        axis.title.y=element_blank(),
        axis.title.x=element_text(size=12,family="Arial",face="bold"),
        axis.text = element_text(size=6, family="Arial", color="#444444"),
        plot.title = element_text(size=16, family="Arial")) + 
  geom_hline(yintercept=1, color="#BB0000") +
  xlab("Episode") + 
  ggtitle("Percent Tatiana Maslany by Episode")
linechart

png(filename = "offline/charts/tmaspercent_25ep.png", width=1800, height=1000, res=200)
linechart
dev.off()