FROM node:12.13.1-slim

RUN apt-get update && \
    apt-get install -y bash python3

WORKDIR /work
ENTRYPOINT ["/bin/bash"]
