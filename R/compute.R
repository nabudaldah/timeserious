
subroutine <- function(script=""){
  expr   <- NULL
  tryCatch(expr <- parse(text=script), error = function(err) print(err))
  if(is.expression(expr))
    tryCatch(eval(expr), error = function(err) print(err))   
}

compute <- function(id){
  
  mongo <- mongo.create();
  bson  <- mongo.find.one(mongo, 'tsdms.models', paste0('{"_id": "', id, '"}'), '{"_id": 0, "X": 1, "y": 1}');
  mongo <- mongo.disconnect(mongo);
  
  model <- mongo.bson.to.list(bson);
  
  y <- tsdms.getvector(model$y, 'data')
  
  N <- length(model$X);
  X <- matrix(data=NA, nrow=length(y), ncol=N)
  for(n in 1:N) X[,n] <- tsdms.getvector(model$X[n], 'data');
  
  lm <- lm(y ~ X)

  tsdms.setvector(id, 'data',  as.numeric(predict(lm)));
  tsdms.trigger('models', 'model001')
    
#  summary(lm)
#  beta0 <- coef(lm)[[1]]
#  beta  <- array()
#  for(b in 1:cols) {
#    print(b)
#    beta[b] <- coef(lm)[[b+1]]
#  }

#  rsqr <- summary(lm)$r.squared  

}

#summary(lm)  
