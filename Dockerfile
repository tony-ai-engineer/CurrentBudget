FROM node
ADD index.js /app/index.js
WORKDIR /app
CMD [ "node" "." ]