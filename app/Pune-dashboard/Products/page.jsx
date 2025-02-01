'use client';
import React, { useState } from 'react';
import NavBar from '../NavBar/NavBar';
import ProductModal from '../../components/ProductModal'; // Import the modal component

const products = [
  {
    name: 'Diesel generating set',
    description:`
      <p>Cummins DG sets are available in the range of 7.5 KVA to 3350 KVA with the fuel option of Diesel or Gas. The advantages of Cummins Technology are:</p>
    <ul>
      <li>Compliant to latest Pollution Control Norms of CPCB IV + (7.5 KVA to 750 KVA)</li>
      <li>Reduce Environmental Impact</li>
      <li>Reduced PM and NOX Impact</li>
      <li>Improved fuel economy</li>
      <li>Silent Power with lowest db Levels</li>
    </ul>
    <p>Eco-friendly Diesel Generators compliant with the latest cutting-edge technology from Cummins is the way towards a sustainable future. The usage of cutting-edge technology by Cummins drastically improves emissions and helps to keep the environment clean and green.</p>
    <p>Only Cummins DG sets are backed with the most efficient 24/7 service support with factory-trained passionate Service Engineers. DG sets powered with Cummins Engines are always way ahead of the competition in adapting to new superior technology, benefiting the end user in reducing operational cost. Cummins is the pioneer in Manufacturing technology of engines suitable for CPCB 4+ Norms.</p>
  `,
    image: '/DGS.png',
  },
  {
    name: 'Retrofit emission control device (RECD)',
    description: `
    RECD are designed to reduce harmful emissions and pollutant particles from the Diesel Generators.

    RECD enhances air quality by capturing carbon matter with more than 91% efficiency. It controls the emissions and hydrocarbons and carbon monoxides from the DG sets Few states across India have mandated to use RECD on the DG set installed with effect from 1 st July

    The latest Norms from all these states are attached for the reference.

    We undertake full end to end responsibility of Supply, Erection, Testing, of the RECD and then we offer Annual Maintain ace Contract through our factory trained engineers. The RECDs supplied and installed and commissioned by us are Designed and manufactured by Pi Green Innovations and the design is patented in 30 Countries. Also they are designed with filter less technology (Electro Static Precipitation) which helps in reducing the overall maintenance cost. Also it causes no harm on the DG sets.

    RECD supplied by us does not impact on the life of the DG set and does require very very low Maintenance.`,
    image: '/RECD.png',
  },
  {
    name: 'Insulated tools',
    description: `
    To enhance safety at workplace, it is always recommended to use insulated tools. 
    We market Insulated tools of INSULA Brand being widely used across industry. These tools are tested as per IS 60900. 
    The tools are tested under IMPACT Test, ELECTRICAL Test, STAMP Test, INSULATION Test,  FLAME RETARDENCY Test, Also the Insulated tools under INSULA brand supplied by us are certified by VDE. VDE is testing and certification institution which is nationally and internationally accredited in the field of testing and certification of electrical engineering devices, components and testing. These electrical products are tested for safety, electromagnetic compatibility and other product Properties.
    Also Insula Brand of Insulated tools are carrying VDE -GS Mark . VDE-GS stands for safety of the product with regard to electrical, Mechanical, thermal, toxicological, radiological and other dangers Insulated Tools are Strongly recommended to be used while in operation in Solar and Wind farms to avoid Accidents .`,
    image: '/Insulated.png',
  },
  {
    name: 'Sparkless tools',
    description: `Non sparking tools are hand tools made from special copper alloys that gives non sparking property.
        These are used potentially in any setting where an ignition source can cause FIRE or EXPLOSION.
        These type of tools have been tested and found to meet the IS 4595 for Non Sparking properties. 
        Sparkless tools are in great demand in Oil &amp; Gas Industry, Chemical Industry, Pharma Industry, Automobile Industry, Thermal Power Plants, Fertilizer Plant, Sugar Mills, Brewaries and Distilleries. Paints and Varnish Industry, Explosive and Ammunition plants, and Waste treatment Plants.
    `,
    image: '/sparkless.png',
  },
  {
    name: 'Overhead light insulation cover',
    description: `
    Insulation sleeves are used to protect overhead Conductor or to avoid shutdowns due to touching of the tree or to avoid shutdowns because of the Birds or to save endangered species of Birds.
    Sleeving is available for LT and HT Lines. Also in some cases when Transmission lines are passing through any human habitat , it is used as a precaution.
    It comes in the role of 50 Meters and we can supply as per the requirement in shortest possible time. These Sleeves are in great demand in Wind and Solar Plants as by using the sleeve we can avoid ROW and thus costly shutdowns.
    It is one time investment and thus investment and time invested in recurring tree cutting is saved.. Also using sleeves on the conductor increases the life of conductors. The sleeves comes in two types one is Lock type of sleeve and other is rap around sleeve both are easy to install at the field. locking type overhead conductor insulation sleeve wrap around type overhead conductor insulation sleeve
    `,
    image: '/overheadLightInsulatorCover.png',
  },
  {
    name: 'Firepress high temperature indication system',
    description: `
    Whatever Fire Suppression systems are available, are all reactive ,means one can use them only when incidence of fire is noticed but the FIPRESS systems which we market ,alerts user about probability of fire by sensing rise in temperatures. These are used in the Pannels and other closed enclosures wherein there is always chance of arcing happening due to the loose termination. 
    It works on real time basis and detects rise in temperatures and informs well in advance for corrective action and thus saves assets and life. It is applicable in almost all the industries, Hospitals, Airports, Schools and practically all the installations where there is use of electricity.`,
    image: '/Fipress.png',
  },
  {
    name: 'CME- SERTEC advance lightning system',
    description: `
    In our conventional lightning system of Rod and Copper strip, there is every chance of damage to assets and travelling of the charge to adjacent installation creating damages to costly electronic equipment as well as may increase the chance of fire.
    CMCE Sertec systems does not attract lightening but rather repels it. This technology is invented in 1916 by renowned scientist Nikola Tesla and evolved over period of last more than 100 years. This technology is proven in saving human assets, and complicated electronic equipments from the lightening strikes.
    This can be used in High rise buildings , all types of industries, especially for the data centres. All the wind and solar plants, pharma industries, Hazardous plants.`,
    image: '/CME.png',
  },
  {
    name: 'Cable jointing kits',
    description: `
  Cable jointing kits are available in LT and HT which are Type approved tested by various agencies.
  Cable jointing kits with proven performance in Wind and Solar Plants are readily available (33 KV for the Wind &amp; 1500 V DC for Solar). These kits are tested so that they withstand very high temperatures and Voltage fluctuations across various industries and especially these kits are suitable for unstable voltage conditions across Wind and Solar Farms.`,
    image: '/CableJoint.png',
  },
  {
    name: 'Heat shrink angle boots',
    description: `
    We supply Right Angle or straight Boots which provides insulation which provides insulation to the bushing in the cable termination box, where the clearance between phase to phase or phase to earth is very less than the normal air clearance. These boots provides protection against flashover in the event of high humadity, rodent menace and surge impulse. These are made from high quality cross linked on tracking polyolefin material. They are internally quoted with water resistant red Mastic.`,
    image: '/HeatTube.png',
  },
  {
    name: 'Heat shrink cable repair sleeve',
    description: `
      Provides permanent waterproof barrier &amp; environmental seal. We can repair the damaged cables on site with these heat shrink repair sleeves. Especially in the setting of very long Cables getting damaged due to rodents in solar plant we can use repair sleeves and repair the cables at the place only. It comes in different sizes.`,
    image: '/HeatShrink.png',
  },
];

const Product = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openModal = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="h-screen w-full bg-white overflow-auto">
      <NavBar />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 text-black">
        {products.map((product, index) => (
          <div
            key={index}
            className="bg-gray-200 p-4 rounded-lg text-center cursor-pointer"
            onClick={() => openModal(product)}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-cover rounded"
            />
            <h3 className="mt-2 text-lg font-bold">{product.name}</h3>
          </div>
        ))}
      </div>
      {selectedProduct && <ProductModal product={selectedProduct} closeModal={closeModal} />}
    </div>
  );
};

export default Product;
