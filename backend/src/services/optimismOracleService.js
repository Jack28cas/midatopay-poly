const { ethers } = require('ethers');

class OptimismOracleService {
  constructor() {
    // RPC de Optimism Mainnet
    this.rpcUrl = process.env.OPTIMISM_RPC_URL || 'https://optimism-mainnet.infura.io/v3/edab64b75f2348e2ab8939563ca78bd4';
    
    // Dirección del contrato Oracle
    this.oracleAddress = process.env.OPTIMISM_ORACLE_ADDRESS || '0xC37c16139a8eFC8f4c2B7CAA5C607514C825FC4C';
    
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
    
    console.log('✅ OptimismOracleService inicializado');
    console.log(`   Oracle Address: ${this.oracleAddress}`);
    console.log(`   RPC URL: ${this.rpcUrl}`);
  }

  // Obtener cotización ARS → USDC (o cualquier token)
  async getARSToUSDTQuote(amountARS, tokenAddress = '0x3d127a80655e4650D97e4499217dC8c083A39242') {
    try {
      console.log(`🔍 Obteniendo cotización: ${amountARS} ARS → USDC...`);
      
      const isActive = await this.oracleContract.active();
      if (!isActive) {
        throw new Error('Oracle está pausado');
      }
      
      const hasPrice = await this.oracleContract.hasPrice(tokenAddress);
      if (!hasPrice) {
        throw new Error(`Token ${tokenAddress} no tiene precio configurado en el oracle`);
      }
      
      const amountARSBigInt = ethers.parseUnits(amountARS.toString(), 0);
      
      const quoteResult = await this.oracleContract.quote(tokenAddress, amountARSBigInt);
      
      const quoteString = ethers.formatUnits(quoteResult, 6);
      const quoteNumber = parseFloat(quoteString);
      
      const priceARS = await this.oracleContract.priceARS(tokenAddress);
      const priceARSNumber = parseFloat(ethers.formatUnits(priceARS, 0));
      
      const rate = priceARSNumber;
      
      console.log(`✅ Cotización obtenida: ${amountARS} ARS = ${quoteNumber} USDC`);
      console.log(`   Rate: 1 USDC = ${rate} ARS`);
      
      return {
        amountARS,
        usdtAmount: quoteNumber,
        rate,
        tokenAddress,
        oracleAddress: this.oracleAddress,
        timestamp: new Date(),
        source: 'OPTIMISM_ORACLE'
      };
    } catch (error) {
      console.error('❌ Error obteniendo cotización del Oracle:', error);
      throw error;
    }
  }

  // Obtener precio ARS de un token
  async getTokenPriceARS(tokenAddress = '0x3d127a80655e4650D97e4499217dC8c083A39242') {
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
      
      const usdcAddress = '0x3d127a80655e4650D97e4499217dC8c083A39242';
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
        usdtTokenAddress: '0x3d127a80655e4650D97e4499217dC8c083A39242',
        status: 'ERROR',
        error: error.message,
        timestamp: new Date()
      };
    }
  }
}

module.exports = OptimismOracleService;

