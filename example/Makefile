
IMAGE_NAME=textlint-plugin-pptx-example

build:
	docker build -t ${IMAGE_NAME} -f textlint.dockerfile .

bash:
	docker run \
	  --rm \
	  -it \
	  -v ${PWD}:/work/ \
	  --entrypoint="bash" ${IMAGE_NAME}

lint:
	docker run \
	  --rm \
	  -v ${PWD}:/work/ \
	  ${IMAGE_NAME} *.pptx