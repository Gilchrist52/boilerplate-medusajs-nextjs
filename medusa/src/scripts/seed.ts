import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createCustomerAccountWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);
  const customerModuleService = container.resolve(Modules.CUSTOMER);
  const authModuleService = container.resolve(Modules.AUTH);

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it", "us"];
  const defaultCustomer = {
    email: "customer@ledronehub.test",
    password: "Test1234!",
    first_name: "John",
    last_name: "Doe",
  };

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          {
            currency_code: "eur",
            is_default: true,
          },
          {
            currency_code: "usd",
          },
        ],
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });
  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Europe",
          currency_code: "eur",
          countries: ["gb", "de", "dk", "se", "fr", "es", "it"],
          payment_providers: ["pp_system_default"],
        },
        {
          name: "USA",
          currency_code: "usd",
          countries: ["us"],
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const regions = regionResult;
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system"
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "European Warehouse",
          address: {
            city: "Copenhagen",
            country_code: "DK",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default"
  })
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
    await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: "Default Shipping Profile",
            type: "default",
          },
        ],
      },
    });
    shippingProfile = shippingProfileResult[0];
  }

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "European Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Europe",
        geo_zones: [
          {
            country_code: "gb",
            type: "country",
          },
          {
            country_code: "de",
            type: "country",
          },
          {
            country_code: "dk",
            type: "country",
          },
          {
            country_code: "se",
            type: "country",
          },
          {
            country_code: "fr",
            type: "country",
          },
          {
            country_code: "es",
            type: "country",
          },
          {
            country_code: "it",
            type: "country",
          },
        ],
      },
      {
        name: "USA",
        geo_zones: [
          {
            country_code: "us",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
    container
  ).run({
    input: {
      api_keys: [
        {
          title: "Webshop",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });
  const publishableApiKey = publishableApiKeyResult[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  
  // Afficher la clé générée pour pouvoir la mettre dans le .env
  logger.info("-----------------------------------------------------");
  logger.info("PUBLISHABLE KEY GÉNÉRÉE :");
  logger.info(publishableApiKey.token);
  logger.info("-----------------------------------------------------");
  
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding default customer account...");

  const existingCustomers = await customerModuleService.listCustomers({
    email: defaultCustomer.email,
  });

  if (existingCustomers.length) {
    logger.info(
      `Default customer already exists: ${defaultCustomer.email}`
    );
  } else {
    const authResponse = await authModuleService.register("emailpass", {
      body: {
        email: defaultCustomer.email,
        password: defaultCustomer.password,
      },
    });

    if (!authResponse.success || !authResponse.authIdentity?.id) {
      throw new Error(
        `Unable to register default customer identity: ${
          authResponse.error || "unknown auth error"
        }`
      );
    }

    await createCustomerAccountWorkflow(container).run({
      input: {
        authIdentityId: authResponse.authIdentity.id,
        customerData: {
          email: defaultCustomer.email,
          first_name: defaultCustomer.first_name,
          last_name: defaultCustomer.last_name,
        },
      },
    });

    logger.info("-----------------------------------------------------");
    logger.info("DEFAULT CUSTOMER CREATED:");
    logger.info(`Email: ${defaultCustomer.email}`);
    logger.info(`Password: ${defaultCustomer.password}`);
    logger.info("-----------------------------------------------------");
  }

  logger.info("Finished seeding default customer account.");

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Drones Professionnels",
          is_active: true,
        },
        {
          name: "Drones Loisirs",
          is_active: true,
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "DJI Mini 4 Pro",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Drones Loisirs")!.id,
          ],
          description:
            "Le drone compact parfait pour capturer des moments incroyables en 4K HDR.",
          handle: "dji-mini-4-pro",
          weight: 249,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            mode_commercialisation: "both", // "sale", "rental", "both"
            tarif_location_journalier_eur: 25,
            tarif_location_journalier_usd: 27,
            title_fr: "DJI Mini 4 Pro",
            description_fr:
              "Le drone compact parfait pour capturer des moments incroyables en 4K HDR.",
            title_en: "DJI Mini 4 Pro",
            description_en:
              "The perfect compact drone to capture incredible moments in 4K HDR.",
            specifications: {
              camera: "4K HDR, 48MP",
              flight_time: "34 min",
              weight: "249g",
              range: "16 km",
            },
          },
          images: [
            {
              url: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=600&h=400&fit=crop",
            },
          ],
          options: [
            {
              title: "Default",
              values: ["Default"],
            },
          ],
          variants: [
            {
              title: "Standard",
              sku: "DJI-MINI-4-PRO",
              options: {
                Default: "Default",
              },
              prices: [
                {
                  amount: 79900, // en centimes (799€)
                  currency_code: "eur",
                },
                {
                  amount: 89900, // en centimes (899$)
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "DJI Air 3",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Drones Professionnels")!.id,
          ],
          description:
            "Drone polyvalent avec double caméra pour des prises de vue professionnelles.",
          handle: "dji-air-3",
          weight: 560,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            mode_commercialisation: "both",
            tarif_location_journalier_eur: 45,
            tarif_location_journalier_usd: 49,
            title_fr: "DJI Air 3",
            description_fr:
              "Drone polyvalent avec double caméra pour des prises de vue professionnelles.",
            title_en: "DJI Air 3",
            description_en:
              "Versatile drone with dual camera for professional footage.",
            specifications: {
              camera: "4K/60fps, 48MP",
              flight_time: "46 min",
              weight: "560g",
              range: "20 km",
            },
          },
          images: [
            {
              url: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=600&h=400&fit=crop",
            },
          ],
          options: [
            {
              title: "Default",
              values: ["Default"],
            },
          ],
          variants: [
            {
              title: "Standard",
              sku: "DJI-AIR-3",
              options: {
                Default: "Default",
              },
              prices: [
                {
                  amount: 109900, // 1099€
                  currency_code: "eur",
                },
                {
                  amount: 119900, // 1199$
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "DJI Mavic 3 Classic",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Drones Professionnels")!.id,
          ],
          description:
            "Drone haut de gamme avec capteur Hasselblad pour des photos exceptionnelles.",
          handle: "dji-mavic-3-classic",
          weight: 895,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            mode_commercialisation: "rental",
            tarif_location_journalier_eur: 75,
            tarif_location_journalier_usd: 82,
            title_fr: "DJI Mavic 3 Classic",
            description_fr:
              "Drone haut de gamme avec capteur Hasselblad pour des photos exceptionnelles.",
            title_en: "DJI Mavic 3 Classic",
            description_en:
              "Premium drone with Hasselblad sensor for exceptional photos.",
            specifications: {
              camera: "4/3 CMOS Hasselblad, 20MP",
              flight_time: "46 min",
              weight: "895g",
              range: "20 km",
            },
          },
          images: [
            {
              url: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=600&h=400&fit=crop",
            },
          ],
          options: [
            {
              title: "Default",
              values: ["Default"],
            },
          ],
          variants: [
            {
              title: "Standard",
              sku: "DJI-MAVIC-3-CLASSIC",
              options: {
                Default: "Default",
              },
              prices: [
                {
                  amount: 199900, // 1999€ pour la vente (même si mode rental, il faut un prix)
                  currency_code: "eur",
                },
                {
                  amount: 219900, // 2199$
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    const inventoryLevel = {
      location_id: stockLocation.id,
      stocked_quantity: 1000000,
      inventory_item_id: inventoryItem.id,
    };
    inventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info("Finished seeding inventory levels data.");

}
