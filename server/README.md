
# Zigbee sample central 

## Description
This is a default code structure to start an IOT project with XBee modules.

You need to connect a XBee coordinator to this central and launch the service.

## Développeur

**Nom :** Sébastien FLEURY  
**Email :** sebastien.fleury@digitalseeder.com  
**Site Web :** https://digitalseeder.com

# Getting Started

1. Copy .env.dist to .env file and edit with local parameters

        cp .env.dist .env

2. Install requirements

       make install

3. Launch application

       make run

## Requirements
* Configure a coordinator and router/enddevice with XCTU ([Download XCTU](https://www.digi.com/products/embedded-systems/digi-xbee/digi-xbee-tools/xctu#productsupport-utilities))
* Ensure to set API mode to same one in the code (default: 2)
* Ensure your user is member of the `dialout` group on Linux (use the `id` command) and add user to group if not already done

      sudo usermod -a -G dialout <YOUR_USERNAME>

* Install command make 
      
      apt install make

