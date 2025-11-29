const { ethers } = require('ethers');

class PolygonOracleService {
  constructor() {
    // RPC de Polygon Mainnet
    this.rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.infura.io/v3/ee1fad49027d4b21be0e64ed49f0c8b5';
    
    // Dirección del contrato Oracle
    this.oracleAddress = process.env.POLYGON_ORACLE_ADDRESS || '0x2eF8D1930b1d20504445943A18d6F70e7ce6ABbe';
    
    // ABI del contrato DynamicFxOracle
    this.oracleABI = [
      'function quote(address token, uint256 amountARS) external view returns(uint256)',
      'function priceARS(address token) external view returns(uint256)',
      'function tokenDecimals(address token) external view returns(uint8)',
      'function hasPrice(address token) external view returns(bool)',
      'function active() external view returns(bool)',
      'function lastUpdated() external view returns(uint256)'
    ];
    
    // Inicializar provider y contrato
    this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
    this.oracleContract = new ethers.Contract(this.oracleAddress, this.oracleABI, this.provider);
    
    console.log('✅ PolygonOracleService inicializado');
    console.log(`   Oracle Address: ${this.oracleAddress}`);
    console.log(`   RPC URL: ${this.rpcUrl}`);
  }

  // Obtener cotización ARS → USDC (o cualquier token)
  async getARSToUSDTQuote(amountARS, tokenAddress = '0xC37c16139a8eFC8f4c2B7CAA5C607514C825FC4C') {
    try {
      console.log(`🔍 Obteniendo cotización: ${amountARS} ARS → USDC...`);
      
      // Verificar que el oracle esté activo
      const isActive = await this.oracleContract.active();
      if (!isActive) {
        throw new Error('Oracle está pausado');
      }
      
      // Verificar que el token tenga precio configurado
      const hasPrice = await this.oracleContract.hasPrice(tokenAddress);
      if (!hasPrice) {
        throw new Error(`Token ${tokenAddress} no tiene precio configurado en el oracle`);
      }
      
      // Convertir amountARS a BigNumber (sin decimales, ya que ARS es entero)
      const amountARSBigInt = ethers.parseUnits(amountARS.toString(), 0);
      
      // Llamar a la función quote del contrato
      const quoteResult = await this.oracleContract.quote(tokenAddress, amountARSBigInt);
      
      // El resultado está en 6 decimales (según el usuario)
      // Convertir de BigNumber a string y luego a número con 6 decimales
      const quoteString = ethers.formatUnits(quoteResult, 6);
      const quoteNumber = parseFloat(quoteString);
      
      // Obtener el precio ARS del token para calcular el rate
      const priceARS = await this.oracleContract.priceARS(tokenAddress);
      const priceARSNumber = parseFloat(ethers.formatUnits(priceARS, 0));
      
      // Calcular el rate (cuántos ARS por 1 USDC)
      const rate = priceARSNumber;
      
      console.log(`✅ Cotización obtenida: ${amountARS} ARS = ${quoteNumber} USDC`);
      console.log(`   Rate: 1 USDC = ${rate} ARS`);
      
      return {
        amountARS,
        usdtAmount: quoteNumber, // En realidad es USDC, pero mantenemos el nombre por compatibilidad
        rate,
        tokenAddress,
        oracleAddress: this.oracleAddress,
        timestamp: new Date(),
        source: 'POLYGON_ORACLE'
      };
    } catch (error) {
      console.error('❌ Error obteniendo cotización del Oracle:', error);
      throw error;
    }
  }

  // Obtener precio ARS de un token
  async getTokenPriceARS(tokenAddress = '0xC37c16139a8eFC8f4c2B7CAA5C607514C825FC4C') {
    try {
      const priceARS = await this.oracleContract.priceARS(tokenAddress);
      return parseFloat(ethers.formatUnits(priceARS, 0));
    } catch (error) {
      console.error('❌ Error obteniendo precio del token:', error);
      throw error;
    }
  }

  // Verificar estado del Oracle
  async checkOracleStatus() {
    try {
      const isActive = await this.oracleContract.active();
      const lastUpdated = await this.oracleContract.lastUpdated();
      const lastUpdatedDate = new Date(Number(lastUpdated) * 1000);
      
      // Verificar si el token USDC tiene precio
      const usdcAddress = '0xC37c16139a8eFC8f4c2B7CAA5C607514C825FC4C';
      const hasPrice = await this.oracleContract.hasPrice(usdcAddress);
      const priceARS = hasPrice ? await this.getTokenPriceARS(usdcAddress) : null;
      
      return {
        isActive,
        hasPrice,
        currentRate: priceARS,
        oracleAddress: this.oracleAddress,
        usdtTokenAddress: usdcAddress,
        lastUpdated: lastUpdatedDate,
        status: isActive && hasPrice ? 'ACTIVE' : 'INACTIVE',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Error verificando estado del Oracle:', error);
      return {
        isActive: false,
        hasPrice: false,
        currentRate: null,
        oracleAddress: this.oracleAddress,
        usdtTokenAddress: '0xC37c16139a8eFC8f4c2B7CAA5C607514C825FC4C',
        status: 'ERROR',
        error: error.message,
        timestamp: new Date()
      };
    }
  }
}

module.exports = PolygonOracleService;

