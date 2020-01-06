IMAGE_NAME=textlint-plugin-pptx-dev

build-develop-image:
	docker build -t ${IMAGE_NAME} -f develop.dockerfile .

develop:
	docker run --rm -it \
	-v ${PWD}:/work \
	${IMAGE_NAME}
