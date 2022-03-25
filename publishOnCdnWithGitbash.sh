#!/bin/bash

command -v yarn > /dev/null 2>&1 || { 
        echo "Precisa ter o Yarn" 
        exit 1
}

CDN_CHAT_COMPONENT_DIR=$1

[ -d "${CDN_CHAT_COMPONENT_DIR}" ] || {
	echo "Destino do CDN [${CDN_CHAT_COMPONENT_DIR}] inválido..."
	exit 2
}

CDN_CHAT_COMPONENT_DIR=`readlink -f "${CDN_CHAT_COMPONENT_DIR}"`

BUILD_DIR=build/static
CSS_DIR=css
JS_DIR=js

ASSETS=(CSS_DIR JS_DIR)

reset
echo " #####"
echo "# Gerando build..."
echo "##########"
echo
yarn build:win

echo 
echo " #####"
echo "# Renomenado assets..."
echo "##########"
cd ${BUILD_DIR}
for ASSET in ${ASSETS[*]}; do
	asset=${!ASSET}
	echo -e "\tRenomenado main.${asset} ..."
	cp ${asset}/main*.${asset} ${asset}/main.${asset}
	for map in ${asset}/main*.${asset}.map; do
		echo -e "\tRenomenado sourcemap main.${asset}.map ..."
		cp ${asset}/main*.${asset}.map ${asset}/main.${asset}.map
	done
done

echo
echo " #####"
echo "# Copiando para o CDN[${CDN_CHAT_COMPONENT_DIR}] ..."
echo "##########"
for ASSET in ${ASSETS[*]}; do
        asset=${!ASSET}
        echo -e "\tCopiando main.${asset} ..."
        mv ${asset}/main.${asset} ${CDN_CHAT_COMPONENT_DIR}/${asset}/main.${asset}
done

echo
echo " #####"
echo "# Pronto"
echo "##########"
