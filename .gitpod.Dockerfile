FROM gitpod/workspace-full

RUN apt-get -yqq update && \
    apt-get install -yq --no-install-recommends ca-certificates apt-utils build-essential git python3 cmake && \
    apt-get autoremove -y && \
    apt-get clean -y;
     