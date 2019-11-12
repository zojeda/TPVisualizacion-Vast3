
#dividir el data en antes, despues, quitar stopwords 
#hacer dos nubes de palabras


rm(list=ls())
library(readr)
library(dplyr)
library(lubridate)
library(tidytext)
library(rtweet)

library(tidyverse)

library(knitr)

setwd("C:/Users/Melo/Desktop/Visualizacion/TPVisualizacion-Vast3-master/TPVisualizacion-Vast3-master/R")
data_dir <- 'data/'


blacklist <- read_csv(paste0(data_dir, "blacklist.csv"))
blacklist_geo <- read_csv(paste0(data_dir, "blacklist_geo.csv"))
datos <- read_csv(paste0(data_dir, "YInt.csv"))

#funciones
limpiar_tokenizar <- function(texto){
  # El orden de la limpieza no es arbitrario
  # Se convierte todo el texto a minúsculas
  nuevo_texto <- tolower(texto)
  # Eliminación de páginas web (palabras que empiezan por "http." seguidas 
  # de cualquier cosa que no sea un espacio)
  nuevo_texto <- str_replace_all(nuevo_texto,"http\\S*", "")
  # Eliminación de signos de puntuación
  nuevo_texto <- str_replace_all(nuevo_texto,"[[:punct:]]", " ")
  # Eliminación de números
  nuevo_texto <- str_replace_all(nuevo_texto,"[[:digit:]]", " ")
  # Eliminación de espacios en blanco múltiples
  nuevo_texto <- str_replace_all(nuevo_texto,"[\\s]+", " ")
  # Tokenización por palabras individuales
  nuevo_texto <- str_split(nuevo_texto, " ")[[1]]
  # Eliminación de tokens con una longitud < 2
  nuevo_texto <- keep(.x = nuevo_texto, .p = function(x){str_length(x) > 1})
  return(nuevo_texto)
}

#Arreglo Datos

datos <- datos %>%
  mutate(
    id = row_number(),
    dia = strtoi(day(time)),
    hora = strtoi(hour(time)),
    minuto = strtoi(minute(time)),
    time_id = minuto + hora * 100 + dia * 10000,
    message = tolower(message)
  )%>%
  select(
    id,
    time_id,
    location,
    account,
    message
  )%>%
  #Elimino los retweet
  filter(!startsWith(message, "re:"))%>%
  #Elimino las cuentas en blacklist
  anti_join(blacklist, by=c("account"="account")) %>%
  #Elimino los barrios en blacklist
  anti_join(blacklist_geo, by=c("location"="neighborhood"))


#Selecciono base para trabajar
datos_antes<- datos[1:8359,]
datos_despues<- datos[8360:16488,]

base_seleccion <-datos_despues




base_seleccion <- base_seleccion %>% mutate(texto_tokenizado = map(.x = message,
                                                                   .f = limpiar_tokenizar))
base_seleccion %>% select(texto_tokenizado) %>% head()
base_seleccion %>% slice(1) %>% select(texto_tokenizado) %>% pull()

tweets_tidy <- base_seleccion %>% select(-message) %>% unnest()
tweets_tidy <- tweets_tidy %>% rename(token = texto_tokenizado)




lista_stopwords <- c('me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
                     'you','your', 'yours', 'yourself', 'yourselves', 'he', 'him','his',
                     'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
                     'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
                     'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
                     'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
                     'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and',
                     'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at',
                     'by', 'for', 'with', 'about', 'against', 'between', 'into',
                     'through', 'during', 'before', 'after', 'above', 'below', 'to',
                     'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
                     'again', 'further', 'then', 'once', 'here', 'there', 'when',
                     'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
                     'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
                     'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will',
                     'just', 'don', 'should', 'now', 'd', 'll', 'm', 'o', 're', 've',
                     'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn', 'hasn',
                     'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan',
                     'shouldn', 'wasn', 'weren', 'won', 'wouldn','i','anyone','even',
                     'us','go','going','let','im','less','ur','th','gt','oh','lt','ya',
                     'yet','put','ish','one','anything','something','really','someone','much'
                     
                     
)

#Agrego palabras A la lista
lista_stopwords <- c(lista_stopwords, "works",'works','good','work','worked')







# Se filtran las stopwords
tweets_tidy <- tweets_tidy %>% filter(!(token %in% lista_stopwords))


tweets_tidy$periodo=c(rep('antes',51392))
#Antes 55590
#despues 51392
#--------------------------

sentimientos <- get_sentiments(lexicon = "bing")


tweets_sent <- inner_join(x = tweets_tidy, y = sentimientos,
                          by = c("token" = "word"))

frec_sent_antes<-tweets_sent %>% group_by(token) %>% count(token) %>%
  top_n(10, n) %>% arrange(desc(n)) %>% print(n=30)

 
#----------------------- Grafica nubes de palabra


library(wordcloud)
library(RColorBrewer)
# antes scale=c(2,.1)
# despues scale=c(2,.05)
wordcloud_custom <- function(grupo, df){
  print(grupo)
  wordcloud(words = df$token, freq = df$frecuencia, scale=c(1.5,0.5),
            max.words = 50, random.order = FALSE, rot.per = 0.1,
            colors = brewer.pal(10, "Dark2"))
}

df_grouped <- tweets_sent %>% group_by(periodo, token) %>% count(token) %>%
  group_by(periodo) %>% mutate(frecuencia = n / n()) %>%
  arrange(periodo, desc(frecuencia)) %>% nest() 

walk2(.x = df_grouped$periodo, .y = df_grouped$data, .f = wordcloud_custom)

frec_palabra<-tweets_sent %>% group_by(token) %>% count(token) %>%
  top_n(10, n) %>% arrange(desc(n)) %>% print(n=30)

library(xlsx)
setwd("C:/Users/Melo/Desktop/")
write.csv(frec_palabra, file = "frec_sent_despues.csv", row.names = F)

