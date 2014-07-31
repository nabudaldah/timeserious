library(rmongodb)

tsdms.getvector <- function(id, field){
  mongo <- mongo.create();
  bson  <- mongo.find.one(mongo, 'tsdms.timeseries', paste0('{"_id": "',id,'"}'), paste0('{"',field,'": 1 }'))
  mongo <- mongo.disconnect(mongo)
  if(is.null(bson))  return(NULL)
  value <- mongo.bson.value(bson, field)
  if(is.null(value)) return(NULL)
  return(as.double(value))
}

#v <- tsdms.getvector("meter005", "data.2014")

tsdms.setvector <- function(id, field, v){
  buf   <- mongo.bson.buffer.create()
  mongo.bson.buffer.start.object(buf, "$set")
  mongo.bson.buffer.append.double(buf, field, v)
  mongo.bson.buffer.finish.object(buf)
  bson  <- mongo.bson.from.buffer(buf)  
  mongo <- mongo.create();
  ok    <- mongo.update(mongo, 'tsdms.timeseries', paste0('{"_id": "', id, '"}'), bson, mongo.update.upsert)
  mongo <- mongo.disconnect(mongo);
  return(ok)
}

#tsdms.setvector("a", "data", runif(1000))
#tsdms.setvector("b", "data", runif(1000))
# ...
#a <- tsdms.getvector("a", "data")
#b <- tsdms.getvector("b", "data")

#c <- a + b

#tsdms.setvector("c", "data", c)

tsdms.trigger <- function(collection, id) {
  bson <- mongo.bson.from.JSON(paste0('{ "event" : "identifier", "message" : "/', collection, '/', id,'" }'))
  mongo <- mongo.create();
  ok    <- mongo.insert(mongo, 'tsdms.triggers', bson)
  mongo <- mongo.disconnect(mongo);    
}

#v  <- as.double(rep(1, 96))
#v_ <- tsdms.scaleDown(v, 4)
#v_ <- tsdms.scaleUp(v, 4);

# Scale array down (from 5 minutes to 15 minutes)
tsdms.scaleDown <- function(vector, n, method = 'mean', na.rm = FALSE){
  matrix <- matrix(vector, ncol = n, byrow=TRUE)
  if(method == 'sum')  vector_ <- rowSums(matrix, na.rm = na.rm);
  if(method == 'mean') vector_ <- rowMeans(matrix, na.rm = na.rm);  
  return(vector_);
}

# Scale array up (from 60 minutes to 15 minutes)
tsdms.scaleUp <- function(vector, n, divide = FALSE){
  matrix <- rep(vector, n)
  matrix <- matrix(matrix, ncol=n)
  vector_ <- c(t(matrix));
  if(divide) vector_ <- vector_ / n;
  return(vector_);
}
